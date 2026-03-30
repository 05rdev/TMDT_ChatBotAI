import 'dotenv/config';
import app from './app';
import { prisma } from '@lib/prisma';
import { redis } from '@lib/redis';
import logger from '@config/logger';

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  try {
    // Kiểm tra kết nối DB
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected');

    // Kiểm tra kết nối Redis
    await redis.ping();
    logger.info('✅ Redis connected');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

bootstrap();
