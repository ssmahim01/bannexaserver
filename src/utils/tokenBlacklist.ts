import { redisGet, redisSet } from "./redis";

const BLACKLIST_PREFIX = "token_blacklist:";
const USER_TOKEN_VERSION_PREFIX = "user_token_version:";

const safeParseInt = (value: string | null | undefined) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export async function blacklistToken(token: string, ttlSeconds: number): Promise<void> {
  const key = `${BLACKLIST_PREFIX}${token}`;
  try {
    await redisSet(key, "1", ttlSeconds);
  } catch {
    return;
  }
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const key = `${BLACKLIST_PREFIX}${token}`;
  try {
    const result = await redisGet(key);
    return result === "1";
  } catch {
    return false;
  }
}

export async function incrementUserTokenVersion(userId: string): Promise<number> {
  const key = `${USER_TOKEN_VERSION_PREFIX}${userId}`;
  try {
    const current = await redisGet(key);
    const newVersion = safeParseInt(current) + 1;
    await redisSet(key, String(newVersion));
    return newVersion;
  } catch {
    return 0;
  }
}

export async function getUserTokenVersion(userId: string): Promise<number> {
  const key = `${USER_TOKEN_VERSION_PREFIX}${userId}`;
  try {
    const version = await redisGet(key);
    return safeParseInt(version);
  } catch {
    return 0;
  }
}

export async function invalidateAllUserTokens(userId: string): Promise<number> {
  return incrementUserTokenVersion(userId);
}
