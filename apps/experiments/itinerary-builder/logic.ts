export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const MAX_DAYS = 14;
export const SAMPLE_BRIEF = "Lisbon, Portugal · 4 days · walkable food and museums";
export function clampDays(n: number): number {
  if (!Number.isFinite(n)) return 3;
  return Math.min(MAX_DAYS, Math.max(1, Math.round(n)));
}
export function inferDays(brief: string): number {
  const m = brief.match(/(\d+)\s*day/i);
  return clampDays(m ? Number(m[1]) : 3);
}
