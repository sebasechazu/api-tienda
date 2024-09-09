'use strict';

import jwt from 'jwt-simple';
import moment from 'moment';
import { config } from 'dotenv';

config();

const secret = process.env.JWT_SECRET;

export const createToken = (user) => {
    const payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        exp: moment().add(30, 'days').unix()
    };
    return jwt.encode(payload, secret);
};

export const authenticateUser = async (req, res, next) => {
    try {
        
        if (!req.headers.authorization) {

            const error = new Error('The request does not have the authentication header');
            error.status = 401;
            throw error;
        }

        const token = req.headers.authorization.replace(/Bearer /, '').trim();

        const payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({ message: 'The token has expired' });
        }

        req.user = payload;
        next();

    } catch (error) {
        
        return res.status(404).send({ message: 'The token is invalid' });
    }
};