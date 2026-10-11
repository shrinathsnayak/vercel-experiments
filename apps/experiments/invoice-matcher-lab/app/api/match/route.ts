import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { clampMatch, MAX_DOC_CHARS, MAX_FIELDS, truncateText } from '../../../logic';

export const maxDuration = 60;

const matchSchema = z.object({
  overallConfidence: z.number().min(0).max(1),
  summary: z.string(),
  fields: z
    .array(
      z.object({
        field: z.string(),
        invoiceValue: z.string(),
        poValue: z.string(),
        status: z.enum(['match', 'mismatch', 'missing']),
        confidence: z.number().min(0).max(1),
        note: z.string().optional(),
      }),
    )
    .max(MAX_FIELDS),
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

  const invoice =
    typeof (json as { invoice?: unknown })?.invoice === 'string'
      ? truncateText((json as { invoice: string }).invoice)
      : '';
  const po =
    typeof (json as { po?: unknown })?.po === 'string'
      ? truncateText((json as { po: string }).po)
      : '';

  if (!invoice || !po) {
    return Response.json({ error: 'invoice and po are required.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: matchSchema,
    prompt: `Compare the invoice against the purchase order.
Return field-level match / mismatch / missing with confidence 0-1.
Cover PO number, vendor, ship-to, line items, quantities, unit prices, tax, and totals when present.
overallConfidence is your aggregate score. summary is one short sentence.
Stay grounded in the texts; use empty strings when a side lacks a value.

INVOICE (max ${MAX_DOC_CHARS} chars):
${invoice}

PO (max ${MAX_DOC_CHARS} chars):
${po}`,
  });

  return Response.json({
    ...clampMatch(result.object),
    provider: providerLabel(),
  });
}
