import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { clampTriage, MAX_FIELD_CHARS, truncateText } from '../../../logic';

export const maxDuration = 60;

const triageSchema = z.object({
  labels: z.array(z.string()).max(8),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  firstResponse: z.string(),
  clarifyingQuestions: z.array(z.string()).max(6),
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

  const title =
    typeof (json as { title?: unknown })?.title === 'string'
      ? truncateText((json as { title: string }).title, 500)
      : '';
  const body =
    typeof (json as { body?: unknown })?.body === 'string'
      ? truncateText((json as { body: string }).body)
      : '';

  if (!title || !body) {
    return Response.json({ error: 'title and body are required.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: triageSchema,
    prompt: `Triage this GitHub issue for a Next.js / Vercel open-source maintainer.
Return labels (kebab-case), severity, a polite firstResponse draft, and clarifyingQuestions.
No GitHub API token is available - do not claim you opened or labeled anything.
Stay grounded in the issue text.

TITLE:
${title}

BODY (max ${MAX_FIELD_CHARS} chars):
${body}`,
  });

  return Response.json({
    ...clampTriage(result.object),
    provider: providerLabel(),
  });
}
