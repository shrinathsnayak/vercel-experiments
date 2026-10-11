import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  clampSchema,
  detectSampleKind,
  MAX_SAMPLE_CHARS,
  truncateText,
} from '../../../logic';

export const maxDuration = 60;

const schemaSchema = z.object({
  typescript: z.string(),
  zod: z.string(),
  notes: z.array(z.string()).max(8),
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

  const sample =
    typeof (json as { sample?: unknown })?.sample === 'string'
      ? truncateText((json as { sample: string }).sample)
      : '';

  if (!sample) {
    return Response.json({ error: 'sample is required.' }, { status: 400 });
  }

  const kind = detectSampleKind(sample);

  const result = await generateObject({
    model: resolveModel(),
    schema: schemaSchema,
    prompt: `Infer TypeScript types and Zod schemas from this ${kind} sample.
typescript: export type(s) / interface(s) as a single code string.
zod: matching Zod schema code string (import { z } from 'zod' optional).
notes: assumptions (optional fields, unions). Do not invent fields not in the sample.
For CSV, treat the header row as keys and infer column types from values.

SAMPLE (max ${MAX_SAMPLE_CHARS} chars):
${sample}`,
  });

  return Response.json({
    ...clampSchema(result.object),
    detectedKind: kind,
    provider: providerLabel(),
  });
}
