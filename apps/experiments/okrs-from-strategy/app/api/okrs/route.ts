import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  objectives: z.array(z.object({
      objective: z.string(),
      keyResults: z.array(z.object({ kr: z.string(), metric: z.string() })).max(5),
    })).max(5)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['strategy'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['strategy'])) : '';
  if (!input) return Response.json({ error: 'strategy is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Draft OKRs grounded in the strategy. Prefer measurable key results.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
