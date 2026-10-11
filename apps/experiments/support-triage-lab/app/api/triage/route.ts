import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { getRedis } from '../../../lib/redis';
import {
  RATE_LIMIT_KEY_PREFIX,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_SECONDS,
  truncateText,
} from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  category: z.enum(['billing', 'bug', 'feature', 'account', 'other']),
  priority: z.enum(['low', 'medium', 'high']),
  reply: z.string(),
});

async function rateLimit(ip: string): Promise<{ ok: boolean; remaining: number }> {
  const redis = getRedis();
  if (!redis) return { ok: true, remaining: RATE_LIMIT_MAX };
  const key = `${RATE_LIMIT_KEY_PREFIX}${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
  }
  return { ok: count <= RATE_LIMIT_MAX, remaining: Math.max(0, RATE_LIMIT_MAX - count) };
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anon';

  const rl = await rateLimit(ip);
  if (!rl.ok) {
    return Response.json(
      {
        error: 'Rate limit exceeded',
        setup: `Try again in ~${RATE_LIMIT_WINDOW_SECONDS}s. Redis-backed limit: ${RATE_LIMIT_MAX}/min.`,
      },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const ticket =
    typeof (json as { ticket?: unknown })?.ticket === 'string'
      ? truncateText((json as { ticket: string }).ticket)
      : '';

  if (!ticket) {
    return Response.json({ error: 'ticket is required.' }, { status: 400 });
  }

  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Triage this support ticket. Pick category + priority and draft a short empathetic reply (max 80 words).

TICKET:
${ticket}`,
  });

  return Response.json({
    triage: result.object,
    mode: 'ai' as const,
    provider: providerLabel(),
    rateLimit: {
      remaining: rl.remaining,
      windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
      backend: getRedis() ? 'redis' : 'none',
    },
    note: getRedis() ? undefined : 'Redis not configured - rate limit skipped.',
  });
}
