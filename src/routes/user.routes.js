'use strict'

import { Router } from 'express';
import { registerUser, loginUser, getUser, getUsers, updateUser } from '../controllers/user.controller.js';
import { authenticateUser } from '../services/jwt.js';

const api = Router();

api.post('/register', registerUser);
api.post('/login', loginUser);
api.get('/user/:id', authenticateUser, getUser);
api.get('/users/:page?', authenticateUser, getUsers);
api.put('/update-user/:id', authenticateUser, updateUser);

export default api;