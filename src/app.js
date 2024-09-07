'use strict'
import express, { urlencoded, json } from 'express';
import cors from 'cors';
const app = express();
// rutas
import userRoutes from './routes/user.routes.js';
// middleware
app.use(cors({
  origin: ['http://localhost:4200', 'https://your-railway-app-name.up.railway.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(json());
// rutas
app.use('/api', userRoutes);
// errores
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message,
      },
    });
  });
export default app;