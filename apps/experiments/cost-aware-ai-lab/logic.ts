export const MAX_PROMPT_CHARS = 4_000;

/** Rough USD / 1M tokens - labeled estimates only, not billing truth. */
export const MODEL_COST_ESTIMATES: Record<
  string,
  { inputPerMTok: number; outputPerMTok: number; label: string }
> = {
  'openai/gpt-4o-mini': { inputPerMTok: 0.15, outputPerMTok: 0.6, label: 'gpt-4o-mini' },
  'openai/gpt-4o': { inputPerMTok: 2.5, outputPerMTok: 10, label: 'gpt-4o' },
  'gpt-4o-mini': { inputPerMTok: 0.15, outputPerMTok: 0.6, label: 'gpt-4o-mini' },
  'gpt-4o': { inputPerMTok: 2.5, outputPerMTok: 10, label: 'gpt-4o' },
};

export type RunMetrics = {
  model: string;
  text: string;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCostUsd: number | null;
  estimateNote: string;
};

export function truncateText(text: string, max = MAX_PROMPT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function estimateCostUsd(
  model: string,
  inputTokens: number | null,
  outputTokens: number | null,
): number | null {
  const rates = MODEL_COST_ESTIMATES[model] ?? MODEL_COST_ESTIMATES['openai/gpt-4o-mini'];
  if (!rates || inputTokens == null || outputTokens == null) return null;
  const cost =
    (inputTokens / 1_000_000) * rates.inputPerMTok +
    (outputTokens / 1_000_000) * rates.outputPerMTok;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

export function defaultModels(): [string, string] {
  return [
    process.env.AI_MODEL_A?.trim() || 'openai/gpt-4o-mini',
    process.env.AI_MODEL_B?.trim() || 'openai/gpt-4o',
  ];
}

export const SAMPLE_PROMPT =
  'In two sentences, explain why labeling AI token costs as estimates matters for demos.';

export const ESTIMATE_DISCLAIMER =
  'Cost figures are rough public-rate ESTIMATES only - not invoices, not Gateway billing, not guarantees.';
