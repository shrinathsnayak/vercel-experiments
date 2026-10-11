import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import {
  clampSpans, heuristicSpans, REDACTION_CAVEAT, truncateText,
} from '../../../logic';

export const maxDuration = 60;
const schema = z.object({
  spans: z.array(z.object({
    type: z.string(),
    text: z.string(),
    start: z.number(),
    end: z.number(),
  })).max(40),
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const text = typeof (json as Record<string, unknown>).text === 'string'
    ? truncateText(String((json as Record<string, unknown>).text)) : '';
  if (!text) return Response.json({ error: 'text is required.' }, { status: 400 });
  const result = await generateObject({
    model: resolveModel(), schema,
    prompt: `Suggest possible PII spans in this text for human review. Include approximate start/end indexes.
Never claim the list is complete. Types like email, phone, ssn, name, address.
TEXT:
${text}`,
  });
  const spans = clampSpans(result.object.spans, text);
  const merged = [...spans, ...heuristicSpans(text)];
  return Response.json({
    spans: merged.slice(0, 40),
    caveat: REDACTION_CAVEAT,
    provider: providerLabel(),
  });
}
