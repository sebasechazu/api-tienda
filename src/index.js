'use strict';

import { config } from 'dotenv';
import app from './app.js';

config();

const port = process.env.PORT || 3000;
let server;

// Simulación de base de datos en memoria
app.locals.fakeDb = {
  users: [
    { id: 1, name: 'Usuario Demo', email: 'demo@demo.com' },
    // Puedes agregar más usuarios de ejemplo aquí
  ]
};

export function getApp() {
  return app;
}

export function getFakeDatabase() {
  return app.locals.fakeDb;
}

export async function startServer() {
  try {
    server = app.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
}

process.on('SIGINT', async () => {
  if (server) {
    server.close(() => {
      console.log('Servidor cerrado correctamente');
      process.exit(0);
    });
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

startServer();
