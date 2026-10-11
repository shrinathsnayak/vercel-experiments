import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  title: z.string(),
status: z.string(),
sections: z.array(z.object({ title: z.string(), body: z.string() })).max(12)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['problem'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['problem'])) : '';
  if (!input) return Response.json({ error: 'problem is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Draft an RFC outline with clear sections (Motivation, Proposal, Alternatives, Risks).

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
