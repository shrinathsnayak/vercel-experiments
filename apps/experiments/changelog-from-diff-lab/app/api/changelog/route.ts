import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { clampChangelog, MAX_DIFF_CHARS, truncateText } from '../../../logic';

export const maxDuration = 60;

const changelogSchema = z.object({
  customerFacing: z.array(z.string()).max(12),
  internalNotes: z.array(z.string()).max(12),
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

  const diff =
    typeof (json as { diff?: unknown })?.diff === 'string'
      ? truncateText((json as { diff: string }).diff)
      : '';

  if (!diff) {
    return Response.json({ error: 'diff is required.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: changelogSchema,
    prompt: `Turn this PR diff / commit log into a changelog draft.
customerFacing: short bullets suitable for release notes (user benefit, no jargon dumps).
internalNotes: engineering notes (risks, follow-ups, migrations).
Stay grounded in the diff; do not invent features that are not present.

DIFF (max ${MAX_DIFF_CHARS} chars):
${diff}`,
  });

  return Response.json({
    ...clampChangelog(result.object),
    provider: providerLabel(),
  });
}
