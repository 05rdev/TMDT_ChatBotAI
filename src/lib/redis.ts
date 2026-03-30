import Redis from 'ioredis';
import logger from '@config/logger';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB) || 0,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('connect', () => logger.info('Redis: connecting...'));
redis.on('ready', () => logger.info('Redis: ready'));
redis.on('error', (err) => logger.error('Redis error:', err));
redis.on('close', () => logger.warn('Redis: connection closed'));

// Helper: get/set with JSON và TTL
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  return data ? (JSON.parse(data) as T) : null;
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds = 300): Promise<void> => {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
};

export const cacheDel = async (...keys: string[]): Promise<void> => {
  if (keys.length > 0) await redis.del(...keys);
};
