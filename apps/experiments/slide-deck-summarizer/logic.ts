export const MAX_TEXT_CHARS = 16_000;

export function truncateText(text: string, max = MAX_TEXT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function isSupportedFilename(name: string): boolean {
  return /\.(txt|md|pdf)$/i.test(name);
}

export function splitSlides(text: string): string[] {
  const byDelimiter = text
    .split(/\n-{3,}\n|\n#{1,3}\s+Slide\s+\d+/i)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byDelimiter.length > 1) return byDelimiter.slice(0, 20);
  const paragraphs = text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40);
  return (paragraphs.length > 1 ? paragraphs : [text.trim()]).slice(0, 20);
}

export const SAMPLE_DECK = `# Slide 1
Edge caching serves stale content while revalidating.

---

# Slide 2
AI Gateway centralizes provider keys for demos.

---

# Slide 3
Honest 503s beat fabricated model output.`;
