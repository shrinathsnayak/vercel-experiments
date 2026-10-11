import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  subjects: z.array(z.string()).max(5),
variants: z.array(z.object({ tone: z.string(), body: z.string() })).max(3)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['article'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['article'])) : '';
  if (!input) return Response.json({ error: 'article is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Remix into newsletter subjects and 2-3 tone variants. Stay faithful to source facts.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
