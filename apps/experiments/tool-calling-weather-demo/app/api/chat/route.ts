import { generateText, stepCountIs, tool } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { mockCalc, mockTime, mockWeather, truncateText, type ToolTraceEntry } from '../../../logic';

export const maxDuration = 60;

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
  if (!prompt) return Response.json({ error: 'prompt is required.' }, { status: 400 });

  const toolTrace: ToolTraceEntry[] = [];

  const result = await generateText({
    model: resolveModel(),
    prompt,
    tools: {
      getWeather: tool({
        description: 'Get mock weather for a city (demo data, not a live API).',
        inputSchema: z.object({ city: z.string() }),
        execute: async ({ city }) => {
          const out = mockWeather(city);
          toolTrace.push({ toolName: 'getWeather', args: { city }, result: out });
          return out;
        },
      }),
      getTime: tool({
        description: 'Get current wall-clock time for an IANA timezone.',
        inputSchema: z.object({ timezone: z.string() }),
        execute: async ({ timezone }) => {
          const out = mockTime(timezone);
          toolTrace.push({ toolName: 'getTime', args: { timezone }, result: out });
          return out;
        },
      }),
      calculate: tool({
        description: 'Evaluate a simple arithmetic expression.',
        inputSchema: z.object({ expression: z.string() }),
        execute: async ({ expression }) => {
          const out = mockCalc(expression);
          toolTrace.push({ toolName: 'calculate', args: { expression }, result: out });
          return out;
        },
      }),
    },
    stopWhen: stepCountIs(6),
  });

  return Response.json({
    text: result.text,
    toolTrace,
    provider: providerLabel(),
    steps: result.steps?.length ?? 0,
  });
}
