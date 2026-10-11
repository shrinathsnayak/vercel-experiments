import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRedis } from '../../../../lib/redis';

const KEY_PREFIX = 'experiments:redis-lab:';
const MAX_TTL = 60 * 60;

const setSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9:_-]+$/),
  value: z.string().min(1).max(2000),
  ttlSeconds: z.number().int().min(1).max(MAX_TTL).default(60),
});

const getSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9:_-]+$/),
});

function unavailable() {
  return NextResponse.json(
    {
      error: 'Redis is not configured',
      setup:
        'Add Upstash Redis via the Vercel Marketplace (one-click Deploy includes it) so UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are injected.',
    },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  const redis = getRedis();
  if (!redis) return unavailable();

  const key = new URL(request.url).searchParams.get('key');
  const parsed = getSchema.safeParse({ key });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid key query param required' }, { status: 400 });
  }

  const fullKey = `${KEY_PREFIX}${parsed.data.key}`;
  const [value, ttl] = await Promise.all([redis.get<string>(fullKey), redis.ttl(fullKey)]);
  return NextResponse.json({
    key: parsed.data.key,
    value,
    ttlSeconds: ttl,
    backend: 'upstash-redis',
  });
}

export async function POST(request: Request) {
  const redis = getRedis();
  if (!redis) return unavailable();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = setSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const fullKey = `${KEY_PREFIX}${parsed.data.key}`;
  await redis.set(fullKey, parsed.data.value, { ex: parsed.data.ttlSeconds });
  return NextResponse.json({
    ok: true,
    key: parsed.data.key,
    ttlSeconds: parsed.data.ttlSeconds,
    backend: 'upstash-redis',
  });
}

export async function DELETE(request: Request) {
  const redis = getRedis();
  if (!redis) return unavailable();

  const key = new URL(request.url).searchParams.get('key');
  const parsed = getSchema.safeParse({ key });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid key query param required' }, { status: 400 });
  }

  await redis.del(`${KEY_PREFIX}${parsed.data.key}`);
  return NextResponse.json({ ok: true, key: parsed.data.key });
}
