import { Redis } from '@upstash/redis';

let cached: Redis | null | undefined;

/**
 * Returns an Upstash Redis client when Marketplace / REST credentials exist.
 * Supports Upstash vars and legacy Vercel KV REST vars.
 */
export function getRedis(): Redis | null {
  if (cached !== undefined) return cached;

  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim();

  if (url && token) {
    cached = new Redis({ url, token });
    return cached;
  }

  cached = null;
  return null;
}

export function redisAvailable(): boolean {
  return getRedis() !== null;
}
