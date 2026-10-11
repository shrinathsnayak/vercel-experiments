import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  product: z.string(),
currentPrice: z.number().nullable(),
targetPrice: z.number().nullable(),
notes: z.array(z.string()).max(6),
buyAdvice: z.string()
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['watch'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['watch'])) : '';
  if (!input) return Response.json({ error: 'watch is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Parse the watch paste. Give cautious buyAdvice. Do not invent live market prices.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
