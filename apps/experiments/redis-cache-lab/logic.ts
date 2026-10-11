export function redisSnippet(): string {
  return `import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
await redis.set('greeting', 'hello', { ex: 60 });
const value = await redis.get('greeting');`;
}

export function clampTtl(seconds: number): number {
  return Math.min(3600, Math.max(1, Math.floor(seconds)));
}
