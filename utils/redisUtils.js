
import { initRedis } from '../config/redisClient.js';

export const clearCategoryCache = async (categoryId = null) => {
  try {
    const redis = await initRedis();

    const keysToDelete = [
      'categories:all*',
      'categories:active',
      'categories:coverImages'
    ];

    if (categoryId) {
      keysToDelete.push(`category:${categoryId}`);
    }

    // Delete all related keys
    for (const key of keysToDelete) {
      await redis.del(key);
    }
  } catch (err) {
    console.error('❌ Redis cache clearing error:', err.message);
    // Do not throw error – allow controller to continue
  }
};

export const getFromCache = async (key) => {
  try {
    const redis = await initRedis();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.error('❌ Redis get cache error:', err.message);
    return null;
  }
};

export const setToCache = async (key, value, ttl = 300) => {
  try {
    const redis = await initRedis();
    await redis.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error('❌ Redis set cache error:', err.message);
  }
};
