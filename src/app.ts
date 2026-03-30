import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { userRouter } from '@modules/user/user.router';
import { productRouter } from '@modules/product/product.router';
import { orderRouter } from '@modules/order/order.router';
import { aiRouter } from '@modules/ai/ai.router';
import { errorHandler } from '@middlewares/error.middleware';
import { notFoundHandler } from '@middlewares/notFound.middleware';
import logger from '@config/logger';

const app = express();

// ─── Security ────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));

// ─── Rate Limiting ────────────────────────────
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ─── Body Parser & Compression ────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ─── Logging ─────────────────────────────────
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ─── Health Check ─────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/products`, productRouter);
app.use(`${API_PREFIX}/orders`, orderRouter);
app.use(`${API_PREFIX}/ai`, aiRouter);

// ─── Error Handlers ───────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
