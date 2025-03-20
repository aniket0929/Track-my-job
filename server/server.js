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
import fs from 'fs';

// Security Packages
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

// Cookie Parser
import cookieParser from 'cookie-parser';

// Add missing import at the top
import cors from 'cors';

// Ensure CORS is configured before routes
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_URL
    : process.env.LOCAL_CLIENT_URL,
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
const buildPath = path.resolve(__dirname, '../client/build');

// Configure morgan for both development and production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // More detailed logging for production
} else {
  app.use(morgan('dev')); // Concise logging for development
}

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

// Add this before your main routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Ensure the build directory exists
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    console.error('Build directory not found:', buildPath);
  }
}

// These middleware should be last
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 4000;

const start = async () => {
  try {
    // Add connection options for better stability
    await connectDB(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');
    
    app.listen(port, () => { 
      console.log(`Server is listening on port ${port}...`);
      console.log('Environment:', process.env.NODE_ENV);
    });

  } catch(error) {
    console.error('Database connection error:', error);
    process.exit(1); // Exit if database connection fails
  }
};

start();