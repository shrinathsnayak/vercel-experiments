import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { clampPlan, extractAuditHints, truncateText } from '../../../logic';

export const maxDuration = 60;

const planSchema = z.object({
  scoreSummary: z.string(),
  fixes: z
    .array(
      z.object({
        priority: z.enum(['P0', 'P1', 'P2']),
        category: z.string(),
        issue: z.string(),
        nextjsFix: z.string(),
      }),
    )
    .max(12),
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

  const lighthouseJson =
    typeof (json as { lighthouseJson?: unknown })?.lighthouseJson === 'string'
      ? truncateText((json as { lighthouseJson: string }).lighthouseJson)
      : '';

  if (!lighthouseJson) {
    return Response.json({ error: 'lighthouseJson is required.' }, { status: 400 });
  }

  const hints = extractAuditHints(lighthouseJson);
  if (!hints.categories.length && !hints.weakAudits.length) {
    return Response.json(
      { error: 'Could not parse Lighthouse JSON (need categories/audits).' },
      { status: 400 },
    );
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: planSchema,
    prompt: `Turn this Lighthouse report into a prioritized Next.js action plan.
scoreSummary: one short paragraph of category scores.
fixes: P0/P1/P2 items with category, issue, and a concrete nextjsFix (App Router / next/image / metadata / bundling).
Stay grounded in the audits; do not invent scores.

CATEGORY HINTS:
${JSON.stringify(hints.categories, null, 2)}

WEAK AUDITS:
${JSON.stringify(hints.weakAudits, null, 2)}

RAW JSON (truncated if long):
${lighthouseJson.slice(0, 12_000)}`,
  });

  return Response.json({
    ...clampPlan(result.object),
    provider: providerLabel(),
  });
}
