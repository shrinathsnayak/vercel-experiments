export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const MAX_SLIDES = 14;
export const SAMPLE_IDEA = "A catalog of honest Vercel platform labs that clone one folder and deploy with Marketplace stores.";
export function clampSlideCount(n: number): number {
  if (!Number.isFinite(n)) return 8;
  return Math.min(MAX_SLIDES, Math.max(4, Math.round(n)));
}
