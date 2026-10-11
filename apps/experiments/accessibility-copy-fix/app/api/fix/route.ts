import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  issues: z.array(z.object({ issue: z.string(), severity: z.string(), rewrite: z.string() })).max(12),
revised: z.string()
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['copy'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['copy'])) : '';
  if (!input) return Response.json({ error: 'copy is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Find accessibility/copy issues and propose rewrites. Prefer clear link text and calm tone.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
