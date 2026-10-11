import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  summary: z.string(),
timeline: z.array(z.object({ time: z.string(), event: z.string() })).max(20),
rootCause: z.string(),
actionItems: z.array(z.object({ owner: z.string(), task: z.string() })).max(12)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['notes'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['notes'])) : '';
  if (!input) return Response.json({ error: 'notes is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Write a blameless postmortem draft grounded only in the notes.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
