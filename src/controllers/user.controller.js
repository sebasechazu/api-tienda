'use strict'
import bcryptjs from 'bcryptjs';
import mongodb from 'mongodb';
import User from '../models/user.model.js';
import { createToken } from '../services/jwt.js';
import { getDatabase } from '../index.js';
import logger from '../utils/logger.js';

const { compare, hashSync } = bcryptjs;
const { ObjectId } = mongodb;

/**
 * Handles the registration of a new user.
 * 
 * This function processes the user registration by validating the request body,
 * checking if the user already exists in the database, hashing the password, 
 * and then storing the user in the database.
 * 
 * @param {Object} req - The request object containing the body with user details.
 * @param {Object} res - The response object used to send back the appropriate HTTP response.
 * 
 * @returns {Promise<void>} Sends an HTTP response with the result of the registration process.
 * 
 * @example
 * // Example usage in an Express route:
 * router.post('/register', registerUser);
 * 
 * // Expected request body:
 * {
 *   "name": "John",
 *   "surname": "Doe",
 *   "nickname": "johndoe",
 *   "email": "johndoe@example.com",
 *   "password": "securepassword123"
 * }
 * 
 * // Possible responses:
 * // - 200: User John registered successfully
 * // - 200: User John already exists in our database
 * // - 400: Complete all fields
 * // - 404: User not registered
 * // - 500: Error message (if something went wrong)
 */
export const registerUser = async (req, res) => {

    try {

        const params = req.body;

        if (params.name && params.surname && params.nickname && params.email && params.password) {

            const user = new User(

                params.name,
                params.surname,
                params.nickname,
                params.email,
                params.password,
                'ROLE_USER',
                null

            );
            const existingUser = await getDatabase().collection('users').findOne({ email: user.email.toLowerCase() });

            if (existingUser) {
                logger.error('Email ' + user.email + ' already exists in our database');
                return res.status(400).send({ message: 'email ' + user.email + ' already exists in our database' });
            } else {

                user.password = hashSync(params.password, 10);
                const userStored = await getDatabase().collection('users').insertOne(user);

                if (userStored.insertedId) {
                    logger.info('User ' + user.name + ' registered successfully')
                    return res.status(200).send({ message: 'User ' + user.name + ' registered successfully' });

                } else {
                    logger.error('User not registered')
                    return res.status(404).send({ message: 'User not registered' });

                }
            }
        } else {
            logger.error('Complete all fields')
            return res.status(400).send({ message: 'Complete all fields' });

        }
    } catch (error) {

        logger.error(error)
        return res.status(500).send({ message: error });

    }
};
/**
 * Handles the login process for a user.
 * 
 * This function validates the provided email and password, checks if the user exists in the database,
 * verifies the password, and generates a token if the credentials are correct. It also logs relevant 
 * information about the login attempt and handles different scenarios based on whether the token 
 * only or both token and user details should be returned.
 * 
 * @param {Object} req - The request object containing the user's email, password, and optional `gettoken` parameter.
 * @param {Object} res - The response object used to send back the appropriate HTTP response.
 * 
 * @returns {Promise<void>} Sends an HTTP response with the result of the login process.
 * 
 * @example
 * // Example usage in an Express route:
 * router.post('/login', loginUser);
 * 
 * // Expected request body:
 * {
 *   "email": "user@example.com",
 *   "password": "userpassword",
 *   "gettoken": true // Optional: Whether to return only the token or both token and user details.
 * }
 * 
 * // Possible responses:
 * // - 200: { token: "<token>" } if `gettoken` is true
 * // - 200: { token: "<token>", user: { ... } } if `gettoken` is false
 * // - 400: Complete all fields
 * // - 404: The email <email> is not registered
 * // - 500: Password is incorrect or error message
 */
export const loginUser = async (req, res) => {
    try {

        const params = req.body;
        const email = params.email;
        const password = params.password;

        if (email && password) {

            const user = await getDatabase().collection('users').findOne({ email: email });

            if (user) {

                const passwordIsCorrect = await compare(password, user.password);

                if (passwordIsCorrect) {

                    const token = createToken(user);

                    if (params.gettoken) {

                        logger.info('Returning token: ' + token)
                        return res.status(200).send({ token });

                    } else {

                        user.password = undefined;
                        logger.info('Returning user and token' + token + user)
                        return res.status(200).send({ token, user });
                    }

                } else {
                    logger.error('Password is incorrect')
                    return res.status(500).send({ message: 'Password is incorrect' });
                }

            } else {
                logger.error('The email ' + email + ' is not registered ')
                return res.status(404).send({ message: 'The email ' + email + ' is not registered ' });
            }
        } else {
            logger.error('Complete all fields')
            return res.status(400).send({ message: 'Complete all fields' });
        }
    }

    catch (error) {
        logger.error(error)
        return res.status(500).send({ message: error });
    }
};

/**
 * Retrieves a user by their ID.
 * 
 * This function validates the provided user ID, checks if the user exists in the database,
 * and returns the user details with the password field excluded. It handles different scenarios
 * such as invalid IDs, non-existent users, and any internal errors.
 * 
 * @param {Object} req - The request object containing the user ID in the request parameters.
 * @param {Object} res - The response object used to send back the appropriate HTTP response.
 * 
 * @returns {Promise<void>} Sends an HTTP response with the user details or an error message.
 * 
 * @example
 * // Example usage in an Express route:
 * router.get('/user/:id', getUser);
 * 
 * // Expected request parameters:
 * // - :id (string): The ID of the user to retrieve.
 * 
 * // Possible responses:
 * // - 200: { user: { ... } } where the user object does not include the password field
 * // - 400: Invalid User ID
 * // - 404: User not found
 * // - 500: Error message (if something went wrong)
 */

export const getUser = async (req, res) => {

    try {

        const userId = req.params.id;

        if (!ObjectId.isValid(userId)) {
            logger.error('Invalid User ID')
            return res.status(400).send({ message: 'Invalid User ID' });
        }

        const user = await getDatabase().collection('users').findOne({ _id: new ObjectId(userId) });

        if (user) {
            user.password = undefined;
            return res.status(200).send({ user });

        } else {
            logger.error('User not found')
            return res.status(404).send({ message: 'User not found' });
        }

    } catch (error) {
        logger.error(error)
        return res.status(500).send({ message: error });
    }
}

/**
 * Retrieves a list of all users from the database.
 * 
 * This function fetches all user records from the database, removes the password field 
 * from each user object for security, logs the successful retrieval action, and returns 
 * the list of users in the response.
 * 
 * @param {Object} req - The request object. No parameters are required in the request body.
 * @param {Object} res - The response object used to send back the list of users.
 * 
 * @returns {Promise<void>} Sends an HTTP response with the list of users.
 * 
 * @example
 * // Example usage in an Express route:
 * router.get('/users', getUsers);
 * 
 * // Possible responses:
 * // - 200: { users: [{ ... }, { ... }, ...] } where each user object does not include the password field
 * // - 500: An error occurred while retrieving users.
 */


export const getUsers = async (req, res) => {
    try {
        const users = await getDatabase().collection('users').find().toArray();

        users.forEach((user) => {
            user.password = undefined;
        });
        logger.info(`List of Users retrieved successfully. Total users: ${users.length}`);

        return res.status(200).send({ users });
    } catch (error) {

        logger.error('Error retrieving users:', error);
        return res.status(500).send({ message: 'An error occurred while retrieving users.' });
    }
};

/**
 * Updates a user's details in the database.
 * 
 * This function handles the update of user information by verifying the user's ID, 
 * ensuring that the user ID is valid, and then updating the user's name, surname, 
 * and nickname in the database.
 * 
 * @param {Object} req - The request object, containing the user ID in the URL parameters and updated user details in the body.
 * @param {string} req.params.id - The ID of the user to update.
 * @param {Object} req.body - The request body containing the updated user information (name, surname, nickname).
 * @param {string} req.body.name - The new name of the user.
 * @param {string} req.body.surname - The new surname of the user.
 * @param {string} req.body.nickname - The new nickname of the user.
 * @param {Object} res - The response object used to send back the appropriate HTTP response.
 * 
 * @returns {Promise<void>} Sends an HTTP response with the result of the update process.
 * 
 * @example
 * // Example usage in an Express route:
 * router.put('/user/:id', updateUser);
 * 
 * // Expected request body:
 * {
 *   "name": "John",
 *   "surname": "Doe",
 *   "nickname": "johnny"
 * }
 * 
 * // Possible responses:
 * // - 200: User updated successfully
 * // - 400: Invalid User ID
 * // - 404: User could not be updated
 * // - 500: An error occurred while updating the user
 */


export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const reqUser = req.body;
        
        if(!ObjectId.isValid(userId)){
            logger.error('Invalid User ID')
            return res.status(400).send({ message: 'Invalid User ID' });
        }

        delete reqUser._id;

        const updateResult = await getDatabase().collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: {name : reqUser.name, surname : reqUser.surname ,nickname : reqUser.nickname} }
        );

        if (updateResult) {
            logger.info('User updated successfully');
            return res.status(200).send({ message: 'User updated successfully' });
        } else {
            logger.error('User could not be updated');
            return res.status(404).send({ message: 'User could not be updated' });
        }

    } catch (error) {
        logger.error(error);
        return res.status(500).send({ message: 'An error occurred while updating the user' });
    }
};
