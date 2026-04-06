const Redis = require('ioredis');

let redis;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3
  });

  redis.on('error', (err) => {
    console.warn('Redis connection error (cache disabled):', err.message);
  });

  redis.on('connect', () => {
    console.log('🔴 Redis connected for caching');
  });
} catch (err) {
  console.warn('Redis not available, caching disabled');
  redis = null;
}

const CACHE_TTL = 300; // 5 minutes

const getCache = async (key) => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const setCache = async (key, data) => {
  if (!redis) return;
  try {
    await redis.setex(key, CACHE_TTL, JSON.stringify(data));
  } catch {
    // Cache write failure is non-critical
  }
};

const invalidateCache = async (pattern) => {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Cache invalidation failure is non-critical
  }
};

module.exports = { getCache, setCache, invalidateCache };
