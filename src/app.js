'use strict'
import express, { json,urlencoded } from 'express';
import cors from 'cors';
import {rateLimit} from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false, 
})
const app = express();

// routes
import userRoutes from './routes/user.routes.js';
// middleware
app.use(cors({
  origin: ['http://localhost:4200', 'https://api-tienda-production-fa4a.up.railway.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(json());
app.use(urlencoded({ extended: true }));
// api entry
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});
app.get('/favicon.ico', (req, res) => res.status(204).end());
// limiter
app.use(limiter);
// routes
app.use('/api', userRoutes);
// errors
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message,
      },
    });
  });
export default app;