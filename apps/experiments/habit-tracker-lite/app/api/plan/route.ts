import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  title: z.string(),
weeklyPlan: z.array(z.object({ day: z.string(), action: z.string() })).max(7),
tips: z.array(z.string()).max(6)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['habit'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['habit'])) : '';
  if (!input) return Response.json({ error: 'habit is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Create a lightweight weekly habit plan with practical tips.

INPUT:
${input}`,
  });
  return Response.json({ ...result.object, provider: providerLabel() });
}
