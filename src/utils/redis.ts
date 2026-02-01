import Redis from "ioredis";
import config from "../config";
import logger from "./logger";

const redis = config.redis_url
  ? new Redis(config.redis_url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,

      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 50, 2000);
      },

      tls: {
        rejectUnauthorized: false,
      },
    })
  : null;

if (redis) {
  redis.on("error", (err) => {
    logger.error("Redis connection error:", err);
  });
  redis.on("connect", () => {
    logger.info("✅ Redis connected");
  });
}

export const redisGet = async (key: string) => {
  if (!redis) return null;
  return redis.get(key);
};

export const redisSet = async (
  key: string,
  value: string,
  ttlSeconds?: number
) => {
  if (!redis) return;
  if (ttlSeconds) {
    await redis.set(key, value, "EX", ttlSeconds);
  } else {
    await redis.set(key, value);
  }
};

export const redisDel = async (key: string) => {
  if (!redis) return;
  await redis.del(key);
};

export default redis;
