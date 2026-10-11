import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  headline: z.string(),
strengths: z.array(z.string()).max(8),
weaknesses: z.array(z.string()).max(8),
landmines: z.array(z.string()).max(6),
talkTracks: z.array(z.string()).max(8)
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
    prompt: `Create a sales battlecard. Stay grounded in the pasted notes; no invented customers.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
