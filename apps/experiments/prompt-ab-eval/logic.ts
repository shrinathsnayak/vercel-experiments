export const MAX_PROMPT_CHARS = 3_000;
export const MAX_SYSTEM_CHARS = 2_000;

export type JudgeScores = {
  clarity: number;
  helpfulness: number;
  concision: number;
  winner: 'A' | 'B' | 'tie';
  rationale: string;
};

export function truncateText(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.round(n)));
}

export const SAMPLE_USER = 'Explain ISR to a junior Next.js developer in under 120 words.';
export const SAMPLE_SYSTEM_A =
  'You are a concise senior engineer. Prefer short paragraphs and concrete Next.js APIs.';
export const SAMPLE_SYSTEM_B =
  'You are a friendly teacher. Use analogies and avoid jargon when possible.';
