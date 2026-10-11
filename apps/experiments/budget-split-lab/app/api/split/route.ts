import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  summary: z.string(),
categories: z.array(z.object({ name: z.string(), amount: z.number(), note: z.string() })).max(12),
perPersonRationale: z.string()
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['expenses'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['expenses'])) : '';
  if (!input) return Response.json({ error: 'expenses is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Explain a fair split. Do not invent amounts not implied by the paste.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
