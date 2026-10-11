import { streamObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  slides: z.array(z.object({
      title: z.string(),
      bullets: z.array(z.string()).max(6),
    })).max(14)
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const input = typeof (json as Record<string, unknown>)?.['idea'] === 'string'
    ? truncateText(String((json as Record<string, unknown>)['idea'])) : '';
  if (!input) return Response.json({ error: 'idea is required.' }, { status: 400 });
  const result = streamObject({
    model: resolveModel(),
    schema,
    prompt: `Stream a concise pitch deck outline (problem, solution, product, GTM, ask).

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
