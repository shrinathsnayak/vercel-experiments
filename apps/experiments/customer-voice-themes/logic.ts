export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_FEEDBACK = "Love the deploy speed but docs on Cron are thin.\nBilling page is confusing.\nSupport replied fast on the Redis issue.\nWish Flags had a local override.";
export function chunkFeedback(text: string, maxChunks = 40): string[] {
  return truncateText(text).split(/\n+/).map((s) => s.trim()).filter(Boolean).slice(0, maxChunks);
}
