import { createClient } from 'redis';
import { logger } from '@/utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = createClient({
  url: redisUrl,
});

redis.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  logger.info('Redis Client Connected');
});

// Initialize Redis connection
let isConnected = false;

export async function connectRedis() {
  if (!isConnected) {
    try {
      await redis.connect();
      isConnected = true;
      logger.info('Redis connection established');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      // Continue without Redis if connection fails
    }
  }
}

// Cache utilities
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!isConnected) return null;
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set value in cache with optional TTL (seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (!isConnected) return;
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await redis.setEx(key, ttl, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  },

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      if (!isConnected) return;
      await redis.del(key);
    } catch (error) {
      logger.error(`Cache del error for key ${key}:`, error);
    }
  },

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      if (!isConnected) return;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      logger.error(`Cache delPattern error for pattern ${pattern}:`, error);
    }
  },
};

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600,
  THIRTY_MINUTES: 1800,
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
};
