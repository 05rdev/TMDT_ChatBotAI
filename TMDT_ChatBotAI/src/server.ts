import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import productRouter from './modules/product/router';
import categoryRouter from './modules/product/category.router';
import userRouter from './modules/user/router';
import orderRouter from './modules/order/router';
import authRouter from './modules/auth/router';
import aiRouter from './modules/ai/router';
import adminRouter from './modules/user/admin.router';

import { errorHandler as globalErrorHandler } from './middlewares/error.middleware';
import { activityLogger } from './middlewares/activity-logger';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(activityLogger);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-commerce AI Server is running' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use(globalErrorHandler);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to TMDT ChatBot AI API');
});

// Start server
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to Database successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
