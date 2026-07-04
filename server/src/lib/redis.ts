import Redis from 'ioredis';

class RedisService {
  private static instance: RedisService;
  private client: Redis;

  private constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on('connect', () => console.log('✅ Redis connected successfully'));
    this.client.on('error', (err) => console.error('❌ Redis error:', err));
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: string, ttlSeconds: number) {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async delete(key: string) {
    await this.client.del(key);
  }

  async deletePattern(pattern: string) {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }
}

export const redisService = RedisService.getInstance();
export const cacheSet = (key: string, value: string, ttl: number) => redisService.set(key, value, ttl);
export const cacheGet = <T>(key: string) => redisService.get(key) as Promise<T | null>;
export const cacheDel = (key: string) => redisService.delete(key);
export const cacheDelPattern = (pattern: string) => redisService.deletePattern(pattern);
