import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { clampSummary, MAX_BULLETS, MAX_POLICY_CHARS, truncateText } from '../../../logic';

export const maxDuration = 60;

const summarySchema = z.object({
  plainSummary: z.string(),
  bullets: z.array(z.string()).max(MAX_BULLETS),
  watchOuts: z.array(z.string()).max(8),
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const policy =
    typeof (json as { policy?: unknown })?.policy === 'string'
      ? truncateText((json as { policy: string }).policy)
      : '';

  if (!policy) {
    return Response.json({ error: 'policy is required.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: summarySchema,
    prompt: `Rewrite this terms/privacy excerpt in plain language.
plainSummary: 2-4 short sentences anyone can understand.
bullets: key points (what is collected, shared, retained, user rights).
watchOuts: things a careful reader should notice (not legal advice).
Stay faithful; do not invent rights or obligations.

POLICY (max ${MAX_POLICY_CHARS} chars):
${policy}`,
  });

  return Response.json({
    ...clampSummary(result.object),
    provider: providerLabel(),
  });
}
