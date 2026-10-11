import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { getRedis, redisAvailable } from '../../../lib/redis';
import {
  CACHE_TTL_SECONDS,
  cacheKey,
  clampFaq,
  hashContent,
  MAX_DOCS_CHARS,
  MAX_FAQ_PAIRS,
  truncateText,
  type FaqPair,
} from '../../../logic';

export const maxDuration = 60;

const faqSchema = z.object({
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .max(MAX_FAQ_PAIRS),
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const markdown =
    typeof (json as { markdown?: unknown })?.markdown === 'string'
      ? truncateText((json as { markdown: string }).markdown)
      : '';

  if (!markdown) {
    return Response.json({ error: 'markdown is required.' }, { status: 400 });
  }

  const hash = await hashContent(markdown);
  const key = cacheKey(hash);
  const redis = getRedis();

  if (redis) {
    const cached = await redis.get<FaqPair[]>(key);
    if (cached && Array.isArray(cached)) {
      return Response.json({
        faqs: clampFaq(cached),
        cached: true,
        cache: 'redis',
        provider: providerLabel(),
        ttlSeconds: CACHE_TTL_SECONDS,
      });
    }
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: faqSchema,
    prompt: `Create up to ${MAX_FAQ_PAIRS} FAQ pairs from this markdown documentation.
Questions should be natural; answers should stay faithful to the docs.

DOCS (max ${MAX_DOCS_CHARS} chars):
${markdown}`,
  });

  const faqs = clampFaq(result.object.faqs);

  if (redis) {
    await redis.set(key, faqs, { ex: CACHE_TTL_SECONDS });
  }

  return Response.json({
    faqs,
    cached: false,
    cache: redisAvailable() ? 'redis' : 'none',
    provider: providerLabel(),
    ttlSeconds: redisAvailable() ? CACHE_TTL_SECONDS : null,
    note: redisAvailable()
      ? undefined
      : 'Redis env not set - FAQ generated without cache.',
  });
}
