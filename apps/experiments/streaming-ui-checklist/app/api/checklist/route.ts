import { streamObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { MAX_ITEMS, MAX_PROMPT_CHARS, truncateText } from '../../../logic';

export const maxDuration = 60;

const checklistSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string().optional(),
      }),
    )
    .max(MAX_ITEMS),
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

  const prompt =
    typeof (json as { prompt?: unknown })?.prompt === 'string'
      ? truncateText((json as { prompt: string }).prompt)
      : '';

  if (!prompt) {
    return Response.json({ error: 'prompt is required.' }, { status: 400 });
  }

  const result = streamObject({
    model: resolveModel(),
    schema: checklistSchema,
    prompt: `Create a practical checklist (up to ${MAX_ITEMS} items) for this request.
Each item needs a short title and optional detail.

REQUEST (max ${MAX_PROMPT_CHARS} chars):
${prompt}`,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const partial of result.partialObjectStream) {
          controller.enqueue(encoder.encode(`${JSON.stringify(partial)}\n`));
        }
      } catch (err) {
        controller.error(err);
        return;
      }
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
