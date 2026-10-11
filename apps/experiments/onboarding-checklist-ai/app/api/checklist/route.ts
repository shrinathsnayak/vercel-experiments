import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  items: z.array(z.object({
      id: z.string(),
      title: z.string(),
      detail: z.string(),
      day: z.number(),
    })).max(20)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['role'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['role'])) : '';
  if (!input) return Response.json({ error: 'role is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Create a practical first-two-weeks onboarding checklist with day numbers.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
