import { openai } from '@ai-sdk/openai';
import { generateObject, stepCountIs, streamText, tool } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable, getServiceStatus } from '../../../../lib/services';

export const maxDuration = 30;

const bodySchema = z.object({
  mode: z.enum(['stream', 'structured', 'tools']).default('stream'),
  prompt: z.string().min(1).max(4000),
});

function resolveModel() {
  const gateway = getServiceStatus('ai-gateway');
  const modelId =
    process.env.AI_MODEL?.trim() ||
    (gateway.available ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

  // AI SDK routes model strings through AI Gateway when AI_GATEWAY_API_KEY / OIDC is present.
  if (gateway.available) {
    return modelId.includes('/') ? modelId : `openai/${modelId}`;
  }

  return openai(modelId.replace(/^openai\//, ''));
}

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(
      {
        error: 'No AI provider configured',
        setup:
          'Add AI_GATEWAY_API_KEY (recommended) or OPENAI_API_KEY to your environment and restart. On Vercel, use one-click deploy or create a Gateway key in the dashboard. This demo never fabricates model output.',
        preferred: 'AI_GATEWAY_API_KEY',
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { mode, prompt } = parsed.data;
  const model = resolveModel();
  const provider = getServiceStatus('ai-gateway').available ? 'ai-gateway' : 'openai';

  if (mode === 'structured') {
    const result = await generateObject({
      model,
      schema: z.object({
        summary: z.string(),
        bullets: z.array(z.string()).max(5),
        sentiment: z.enum(['positive', 'neutral', 'negative']),
      }),
      prompt,
    });
    return Response.json({ ...result.object, provider });
  }

  if (mode === 'tools') {
    const result = streamText({
      model,
      prompt,
      tools: {
        add: tool({
          description: 'Add two numbers',
          inputSchema: z.object({ a: z.number(), b: z.number() }),
          execute: async ({ a, b }) => ({ sum: a + b }),
        }),
      },
      stopWhen: stepCountIs(3),
    });
    return result.toTextStreamResponse({
      headers: { 'x-ai-provider': provider },
    });
  }

  const result = streamText({
    model,
    prompt,
  });
  return result.toTextStreamResponse({
    headers: { 'x-ai-provider': provider },
  });
}
