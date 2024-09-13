'use strict';

import { MongoClient, ServerApiVersion } from 'mongodb';
import { config } from 'dotenv';
import app from './app.js';
import open from 'open';
import net from 'net';

//console.clear();

config();

const username = process.env.APP_USERNAME;
const password = process.env.PASSWORD;
const dbName = process.env.DB_NAME;
const port = process.env.PORT;

const uri = `mongodb+srv://${username}:${password}@cluster0.6gwvgg8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let server;

export async function connectDatabase() {
  try {
    await client.connect();
    console.log('Successful connection to the database');
    app.locals.db = client.db(dbName);
    console.log('Connected database:', dbName);
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }
}

export function getApp() {
  return app;
}

export function getDatabase() {
  if (!app.locals.db) {
    throw new Error('Database is not connected.');
  }
  return app.locals.db;
}

export async function startServer() {
  try {
    await connectDatabase();


    server = app.listen(port, async () => {
      console.log(`Server running on the port ${port}`);

      const client = new net.Socket();

      client.once('connect', () => {
        client.end();
      });

      client.once('error', async (err) => {
        if (err.code === 'ECONNREFUSED') {
          await open(`http://localhost:${port}/status`);
        }
      });

      client.connect({ port });
    });

  } catch (error) {
    console.error('Server Startup Failed:', error);
  }
}

process.on('SIGINT', async () => {
  console.log('Closing the Database Connection');
  await client.close();

  if (server) {
    server.close(() => {
      console.log('Server closed correctly');
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
