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
import { config } from 'dotenv';

config();

const url = process.env.CLIENT_URL;

console.log(url);

app.set('trust proxy', 1);

// rutas
import userRoutes from './routes/user.routes.js';

// middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', url || 'https://sebasechazu.github.io');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
      return res.sendStatus(200); // Si la solicitud es de tipo OPTIONS, responde con éxito
  }
  next(); // Continúa con la siguiente middleware o ruta
});


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