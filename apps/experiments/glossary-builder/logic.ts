export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_TEXT = "Edge Middleware runs before the cache. ISR revalidates pages on a timer or on-demand. Partial Prerendering combines static shells with dynamic holes.";
export function extractCandidateTerms(text: string): string[] {
  const matches = truncateText(text).match(/\b[A-Z][A-Za-z0-9-]{2,}(?:\s[A-Z][A-Za-z0-9-]{2,})?\b/g) ?? [];
  return [...new Set(matches)].slice(0, 20);
}
