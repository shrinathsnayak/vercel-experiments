import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  highlightMatches,
  MAX_PATTERN_CHARS,
  MAX_TEST_CHARS,
  truncateText,
} from '../../../logic';

export const maxDuration = 60;

const explainSchema = z.object({
  plainEnglish: z.string(),
  parts: z
    .array(
      z.object({
        token: z.string(),
        meaning: z.string(),
      }),
    )
    .max(24),
  caveats: z.array(z.string()).max(8),
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

  const pattern =
    typeof (json as { pattern?: unknown })?.pattern === 'string'
      ? truncateText((json as { pattern: string }).pattern, MAX_PATTERN_CHARS)
      : '';
  const flags =
    typeof (json as { flags?: unknown })?.flags === 'string'
      ? (json as { flags: string }).flags
      : 'g';
  const testString =
    typeof (json as { testString?: unknown })?.testString === 'string'
      ? (json as { testString: string }).testString.slice(0, MAX_TEST_CHARS)
      : '';

  if (!pattern) {
    return Response.json({ error: 'pattern is required.' }, { status: 400 });
  }

  const highlights = highlightMatches(pattern, testString, flags);
  if (!highlights.ok) {
    return Response.json({ error: highlights.error }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: explainSchema,
    prompt: `Explain this JavaScript regular expression in plain English.
plainEnglish: short overview of what it matches.
parts: token → meaning for important pieces (escape sequences, classes, quantifiers).
caveats: edge cases or flag effects. Be accurate for JS RegExp semantics.

PATTERN: /${pattern}/${highlights.flags}
TEST STRING (for context only; highlighting is done in code):
${testString || '(empty)'}`,
  });

  return Response.json({
    ...result.object,
    highlights,
    provider: providerLabel(),
  });
}
