import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { clampPlan, detectHints, truncateText } from '../../../logic';

export const maxDuration = 60;

const planSchema = z.object({
  likelyCause: z.string(),
  nextjsTips: z.array(z.string()).max(8),
  reproChecklist: z.array(z.string()).max(8),
  docsHints: z.array(z.string()).max(6),
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

  const error =
    typeof (json as { error?: unknown })?.error === 'string'
      ? truncateText((json as { error: string }).error, 4_000)
      : '';
  const stack =
    typeof (json as { stack?: unknown })?.stack === 'string'
      ? truncateText((json as { stack: string }).stack)
      : '';

  if (!error) {
    return Response.json({ error: 'error message is required.' }, { status: 400 });
  }

  const hints = detectHints(error, stack);

  const result = await generateObject({
    model: resolveModel(),
    schema: planSchema,
    prompt: `Diagnose this Next.js error + stack for an App Router developer.
Return likelyCause, nextjsTips (actionable), reproChecklist (steps to confirm), docsHints (topic keywords, not fake URLs).
Stay grounded; do not invent file contents.

DETECTED HINTS: ${hints.join(', ') || '(none)'}

ERROR:
${error}

STACK:
${stack || '(none)'}`,
  });

  return Response.json({
    ...clampPlan(result.object),
    detectedHints: hints,
    provider: providerLabel(),
  });
}
