import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

let redisClient;

const initRedis = async () => {
  if (process.env.REDIS_ENABLED !== 'true') {
    console.log('Redis is disabled by environment variable.');
    return null;
  }
  if (!redisClient) {
    console.log('🔄 Initializing Redis client...');
    if (!process.env.REDIS_HOST || !process.env.REDIS_PORT || !process.env.REDIS_PASSWORD) {
      throw new Error('Redis configuration is missing. Please set REDIS_HOST, REDIS_PORT, and REDIS_PASSWORD in your environment variables.');
    }
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
      password: process.env.REDIS_PASSWORD,
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });

    await redisClient.connect();
    console.log('✅ Redis connected');
  }
  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient && process.env.REDIS_ENABLED === 'true') {
    await redisClient.disconnect();
    console.log('🔌 Redis disconnected');
    redisClient = null;
  }
};

export { initRedis, disconnectRedis, redisClient };
