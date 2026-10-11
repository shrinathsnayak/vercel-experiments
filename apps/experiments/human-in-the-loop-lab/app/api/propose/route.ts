import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { heuristicEmail, MAX_BRIEF_CHARS, truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  to: z.string(),
  subject: z.string(),
  body: z.string(),
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

  const brief =
    typeof (json as { brief?: unknown })?.brief === 'string'
      ? truncateText((json as { brief: string }).brief, MAX_BRIEF_CHARS)
      : '';
  if (!brief) return Response.json({ error: 'brief is required.' }, { status: 400 });

  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Draft a short professional email from this brief. Keep body under 200 words.\n\nBRIEF:\n${brief}`,
  });

  return Response.json({
    email: result.object,
    fallback: heuristicEmail(brief),
    provider: providerLabel(),
  });
}
