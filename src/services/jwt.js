'use strict';

import jwt from 'jwt-simple';
import moment from 'moment';
import { config } from 'dotenv';
import logger from '../utils/logger.js';

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
        const token = req.headers.authorization.replace(/Bearer /, '').trim();
        const payload = jwt.decode(token, secret);
    
        if (payload.exp <= moment().unix()){    
            logger.error('The token has expired');
            return res.status(401).send({ message: 'The token has expired' });
        }
    
        req.user = payload;
        next();
    
    } catch (error) {
        if (error.message === 'Token expired') {
            logger.error('The token is expired');
            return res.status(401).send({ message: 'The token has expired' });
        } else {
            logger.error('The token is invalid: ' + error.message);
            return res.status(400).send({ message: 'The token is invalid' });
        }
    }
    
};