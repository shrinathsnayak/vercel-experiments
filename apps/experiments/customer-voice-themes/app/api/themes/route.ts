import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  themes: z.array(z.object({
      name: z.string(),
      sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']),
      quotes: z.array(z.string()).max(4),
      summary: z.string(),
    })).max(10)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['feedback'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['feedback'])) : '';
  if (!input) return Response.json({ error: 'feedback is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Cluster feedback into themes with short quotes from the text only.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
