import Redis from "ioredis";

// Create Redis client
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
});

// Connection event handlers
redis.on("error", (err: Error) => {
  console.error("Redis Client Error:", err.message);
});

redis.on("connect", () => {
  console.log("Redis Client Connected");
});

// Connect to Redis
redis.connect().catch((err: Error) => {
  console.error("Failed to connect to Redis:", err.message);
});

// =============================================================================
// RATE LIMITING
// =============================================================================

/**
 * Rate limiting with sliding window algorithm
 * Uses Redis sorted sets for accurate rate limiting
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);

    if (count >= limit) {
      return false;
    }

    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, windowSeconds);

    return true;
  } catch (error) {
    console.error(`Redis rate limit error for ${identifier}:`, error);
    return true; // Fail open
  }
}

/**
 * Get remaining requests in current window
 */
export async function getRateLimitInfo(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ remaining: number; resetIn: number }> {
  try {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);
    const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
    const resetIn =
      oldest.length > 1
        ? Math.ceil(
            (parseInt(oldest[1], 10) + windowSeconds * 1000 - now) / 1000
          )
        : windowSeconds;

    return {
      remaining: Math.max(0, limit - count),
      resetIn: Math.max(0, resetIn),
    };
  } catch (error) {
    console.error(`Redis rate limit info error for ${identifier}:`, error);
    return { remaining: limit, resetIn: windowSeconds };
  }
}

// =============================================================================
// CACHE HELPERS
// =============================================================================

/**
 * Cache get with JSON parsing
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
}

/**
 * Cache set with TTL
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<boolean> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Redis SET error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete cache key
 */
export async function cacheDelete(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Redis DEL error for key ${key}:`, error);
    return false;
  }
}

export default redis;
