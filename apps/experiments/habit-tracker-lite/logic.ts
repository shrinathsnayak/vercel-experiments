export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_HABIT = "Walk 20 minutes after lunch";
/** dates as YYYY-MM-DD sorted ascending */
export function computeStreak(dates: string[]): number {
  const uniq = [...new Set(dates)].sort();
  if (uniq.length === 0) return 0;
  let streak = 1;
  for (let i = uniq.length - 1; i > 0; i -= 1) {
    const cur = new Date(uniq[i] + 'T00:00:00Z').getTime();
    const prev = new Date(uniq[i - 1] + 'T00:00:00Z').getTime();
    if (cur - prev === 86_400_000) streak += 1;
    else break;
  }
  return streak;
}
