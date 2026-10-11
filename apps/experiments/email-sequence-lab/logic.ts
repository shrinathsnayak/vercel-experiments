export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_BRIEF = "Product: Vercel Experiments catalog\nAudience: Next.js engineers evaluating platform services\nGoal: first deploy of a lab within 7 days";
export function spaceDays(count: number, startDay = 0): number[] {
  const n = Math.max(1, Math.min(8, Math.round(count)));
  const gap = n <= 1 ? 0 : Math.max(1, Math.round(6 / (n - 1)));
  return Array.from({ length: n }, (_, i) => startDay + i * gap);
}
