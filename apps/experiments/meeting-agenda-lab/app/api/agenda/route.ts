import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  title: z.string(),
totalMinutes: z.number(),
items: z.array(z.object({ topic: z.string(), minutes: z.number(), owner: z.string() })).max(12)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['brief'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['brief'])) : '';
  if (!input) return Response.json({ error: 'brief is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Create a timed agenda that fits the duration. Include owners when implied.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
