export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_ARTICLE = "We shipped Cache Components for Next.js. Teams can mark routes as cacheable and stream the rest. Early adopters report simpler mental models for partial prerendering.";
export function countWords(text: string): number {
  return truncateText(text).split(/\s+/).filter(Boolean).length;
}
