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
import bannerRouter from './modules/banner/router';

import { errorHandler as globalErrorHandler } from './middlewares/error.middleware';
import { activityLogger } from './middlewares/activity-logger';
import { maintenanceMiddleware } from './middlewares/maintenance.middleware';


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
app.use(maintenanceMiddleware);
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
app.use('/api/banners', bannerRouter);


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

// ====== OLLAMA WARM-UP ======
// Pre-load AI models khi server khởi động để tránh cold-start timeout
async function warmupOllama() {
  const ollamaChat = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
  const ollamaEmbed = ollamaChat.replace('/api/chat', '/api/embeddings');
  const chatModel = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
  const embedModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

  console.log('🔥 [Warmup] Đang pre-load AI models...');

  // Warm-up Chat Model
  try {
    const chatRes = await fetch(ollamaChat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: chatModel,
        messages: [{ role: 'user', content: 'ping' }],
        stream: false,
        keep_alive: -1,
        options: { num_predict: 1 }
      }),
      signal: AbortSignal.timeout(120_000),
    });
    if (chatRes.ok) {
      console.log(`✅ [Warmup] Chat model "${chatModel}" loaded successfully.`);
    } else {
      console.warn(`⚠️ [Warmup] Chat model response: ${chatRes.status}`);
    }
  } catch (e: any) {
    console.warn(`⚠️ [Warmup] Chat model failed: ${e.message}. AI sẽ load khi có request đầu tiên.`);
  }

  // Warm-up Embedding Model
  try {
    const embedRes = await fetch(ollamaEmbed, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: embedModel,
        prompt: 'warmup',
        keep_alive: -1,
      }),
      signal: AbortSignal.timeout(120_000),
    });
    if (embedRes.ok) {
      console.log(`✅ [Warmup] Embedding model "${embedModel}" loaded successfully.`);
    } else {
      console.warn(`⚠️ [Warmup] Embedding model response: ${embedRes.status}`);
    }
  } catch (e: any) {
    console.warn(`⚠️ [Warmup] Embedding model failed: ${e.message}. Embedding sẽ load khi có request đầu tiên.`);
  }
}

// Start server
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to Database successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // Khởi chạy trình quét giao dịch SePay tự động (Giải quyết vấn đề phát triển trên localhost không nhận được webhook)
      if (process.env.SEPAY_POLLING_ENABLED === 'true') {
        try {
          const { startSepayPolling } = require('./modules/order/services/sepay-polling.service');
          startSepayPolling(Number(process.env.SEPAY_POLLING_INTERVAL_MS) || 30000);
        } catch (pollingErr) {
          console.error('Failed to start SePay polling service:', pollingErr);
        }
      } else {
        console.log('[SePay Polling] Disabled. Set SEPAY_POLLING_ENABLED=true to enable transaction polling.');
      }

      // Warm-up Ollama models (chạy nền, không block server)
      warmupOllama();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
