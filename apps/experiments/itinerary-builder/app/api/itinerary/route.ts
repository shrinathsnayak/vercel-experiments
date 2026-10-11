import { streamObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  days: z.array(z.object({
      day: z.number(),
      title: z.string(),
      blocks: z.array(z.object({ time: z.string(), activity: z.string() })).max(8),
    })).max(14)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['brief'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['brief'])) : '';
  if (!input) return Response.json({ error: 'brief is required.' }, { status: 400 });
  const result = streamObject({
    model: resolveModel(),
    schema,
    prompt: `Build a practical day-by-day itinerary. Respect the day count if provided.

INPUT:
${input}`,
  });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const partial of result.partialObjectStream) {
          controller.enqueue(encoder.encode(`${JSON.stringify(partial)}\n`));
        }
      } catch (err) { controller.error(err); return; }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'x-ai-provider': providerLabel(),
      'cache-control': 'no-store',
    },
  });
}
