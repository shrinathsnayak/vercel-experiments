import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRedis } from '../../../lib/redis';

const bodySchema = z.object({
  bucket: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9:_-]+$/)
    .default('demo'),
  limit: z.number().int().min(1).max(100).default(5),
  windowSeconds: z.number().int().min(1).max(3600).default(10),
});

export async function POST(request: Request) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      {
        error: 'Redis is not configured',
        setup: 'Provision Upstash Redis (Marketplace / Deploy button) for distributed rate limiting.',
        mode: 'unavailable',
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    json = {};
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { bucket, limit, windowSeconds } = parsed.data;
  const key = `experiments:ratelimit:${bucket}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  const ttl = await redis.ttl(key);
  const allowed = count <= limit;

  return NextResponse.json(
    {
      allowed,
      count,
      limit,
      remaining: Math.max(0, limit - count),
      resetInSeconds: ttl > 0 ? ttl : windowSeconds,
      backend: 'upstash-redis',
      algorithm: 'fixed-window',
    },
    { status: allowed ? 200 : 429 },
  );
}
