import { generateText } from 'ai';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModelId,
} from '../../../lib/ai-model';
import {
  defaultModels,
  ESTIMATE_DISCLAIMER,
  estimateCostUsd,
  truncateText,
  type RunMetrics,
} from '../../../logic';

export const maxDuration = 60;

async function runOne(model: string, prompt: string): Promise<RunMetrics> {
  const started = Date.now();
  const result = await generateText({
    model: resolveModelId(model),
    prompt,
  });
  const inputTokens = result.usage?.inputTokens ?? null;
  const outputTokens = result.usage?.outputTokens ?? null;
  return {
    model,
    text: result.text.trim(),
    latencyMs: Date.now() - started,
    inputTokens,
    outputTokens,
    estimatedCostUsd: estimateCostUsd(model, inputTokens, outputTokens),
    estimateNote: ESTIMATE_DISCLAIMER,
  };
}

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

  const [modelA, modelB] = defaultModels();
  const [a, b] = await Promise.all([runOne(modelA, prompt), runOne(modelB, prompt)]);

  return Response.json({
    runs: [a, b],
    provider: providerLabel(),
    estimateDisclaimer: ESTIMATE_DISCLAIMER,
  });
}
