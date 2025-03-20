import express from 'express';
const app = express();

import dotenv from 'dotenv';
dotenv.config();

// express-async-errors 
import 'express-async-errors';

import morgan from 'morgan';

// Database and Authentication
import connectDB from './db/connect.js';

// Routers
import authRouter from './routes/authRoutes.js';
import jobsRouter from './routes/jobsRoutes.js';

// Middleware
import notFoundMiddleware from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';
import authenticateUser from './middleware/authenticate.js';

// Deployment
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Security Packages
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

// Cookie Parser
import cookieParser from 'cookie-parser';

// Update CORS configuration
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_URL  // Add this to your .env file
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Add security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", process.env.PRODUCTION_URL || 'http://localhost:3000'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));

const __dirname = dirname(fileURLToPath(import.meta.url));

// Update static file serving for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

app.use(express.json());
app.use(cookieParser());

// Use security packages for Express app
app.use(mongoSanitize());

app.get('/api/v1', (req, res) => {
  res.send('Hello');
})

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

const port = process.env.PORT || 4000;

const start = async () => {
  try{
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => { 
      console.log(`Server is listening on port ${port}...`)
    });

  } catch(error){
    console.log(error);
  }
};

start();