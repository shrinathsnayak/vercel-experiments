import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  entries: z.array(z.object({
      key: z.string(),
      source: z.string(),
      placeholders: z.array(z.string()).max(6),
      locales: z.object({ es: z.string(), fr: z.string(), de: z.string() }),
    })).max(40)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['strings'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['strings'])) : '';
  if (!input) return Response.json({ error: 'strings is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Build an i18n catalog with stable keys and sample es/fr/de. Preserve placeholders.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
