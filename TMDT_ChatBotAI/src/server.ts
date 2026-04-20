import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { prisma } from './lib/prisma';
import productRouter from './modules/product/router';
import categoryRouter from './modules/product/category.router';
import cartRouter from './modules/cart/router';
import orderRouter from './modules/order/router';
import userRouter from './modules/user/router';
import authRouter from './modules/auth/router';
import aiRouter from './modules/ai/router';
import adminRouter from './modules/user/admin.router';
import voucherRouter from './modules/voucher/router';
import notificationRouter from './modules/notification/router';
import supportRouter from './modules/support/router';

import { errorHandler as globalErrorHandler } from './middlewares/error.middleware';
import { activityLogger } from './middlewares/activity-logger';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(activityLogger);
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/users', userRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/vouchers', voucherRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/support', supportRouter);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to TMDT ChatBot AI API');
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use(globalErrorHandler);

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
