import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  terms: z.array(z.object({
      term: z.string(),
      definition: z.string(),
      related: z.array(z.string()).max(4),
    })).max(20)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['text'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['text'])) : '';
  if (!input) return Response.json({ error: 'text is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Build a glossary. Prefer terms present in the text; do not invent unrelated jargon.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
