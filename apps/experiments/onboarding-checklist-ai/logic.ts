export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_ROLE = "New frontend engineer joining the Platform team (Next.js + Vercel)";
export function progressPercent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.min(done, total) / total) * 100);
}
