import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { clampConfidence, heuristicFill, truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  fields: z.array(
    z.object({
      key: z.enum(['fullName', 'email', 'phone', 'company', 'role']),
      label: z.string(),
      value: z.string(),
      confidence: z.number(),
    }),
  ),
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

  const prose =
    typeof (json as { prose?: unknown })?.prose === 'string'
      ? truncateText((json as { prose: string }).prose)
      : '';
  if (!prose) return Response.json({ error: 'prose is required.' }, { status: 400 });

  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `Extract form fields from prose. Keys must be fullName, email, phone, company, role.
Confidence 0-1. Leave value empty if unknown. Do not invent emails.\n\nPROSE:\n${prose}`,
  });

  const fields = result.object.fields.map((f) => ({
    ...f,
    confidence: clampConfidence(f.confidence),
  }));

  return Response.json({
    fields,
    heuristic: heuristicFill(prose),
    provider: providerLabel(),
  });
}
