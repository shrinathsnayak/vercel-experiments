export const MAX_DOCS_CHARS = 14_000;
export const MAX_FAQ_PAIRS = 12;
export const CACHE_TTL_SECONDS = 60 * 60;

export type FaqPair = {
  question: string;
  answer: string;
};

export function truncateText(text: string, max = MAX_DOCS_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampFaq(pairs: FaqPair[]): FaqPair[] {
  return pairs.slice(0, MAX_FAQ_PAIRS).map((p) => ({
    question: p.question.trim(),
    answer: p.answer.trim(),
  }));
}

export async function hashContent(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function cacheKey(hash: string): string {
  return `experiments:docs-to-faq:${hash}`;
}

export const SAMPLE_DOCS = `# Redis cache lab

Use Upstash Redis REST credentials to cache JSON with a TTL.
When Redis is not configured, the demo skips the cache and regenerates.

## Limits

- Keys are namespaced under experiments:
- Values should be JSON-serializable
`;
