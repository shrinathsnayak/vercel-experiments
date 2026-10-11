import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { getRedis } from '../../../lib/redis';
import { setMemoryHeadlines } from '../../../lib/store';
import { truncateText, type Headlines } from '../../../logic';

export const maxDuration = 60;

const HEADLINES_KEY = 'experiments:ab-landing:headlines';

const schema = z.object({
  A: z.string(),
  B: z.string(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const topic =
    typeof (json as { topic?: unknown })?.topic === 'string'
      ? truncateText((json as { topic: string }).topic)
      : '';

  if (!topic) {
    return Response.json({ error: 'topic is required.' }, { status: 400 });
  }

  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Write two distinct landing-page headlines (A and B) for this product topic. Max 12 words each. No quotes.

TOPIC: ${topic}`,
  });
  const headlines: Headlines = result.object;
  const provider = providerLabel();

  const redis = getRedis();
  if (redis) await redis.set(HEADLINES_KEY, headlines);
  else setMemoryHeadlines(headlines);

  return Response.json({
    headlines,
    provider,
    storage: redis ? 'redis' : 'memory',
  });
}

export async function GET() {
  const redis = getRedis();
  if (redis) {
    const headlines = await redis.get<Headlines>(HEADLINES_KEY);
    return Response.json({ headlines, storage: 'redis' as const });
  }
  const { memoryHeadlines } = await import('../../../lib/store');
  return Response.json({ headlines: memoryHeadlines, storage: 'memory' as const });
}
