export const MAX_DOC_CHARS = 40_000;
export const DEFAULT_CHUNK_SIZE = 800;
export const DEFAULT_CHUNK_OVERLAP = 100;
export const TOP_K = 4;

export type Chunk = {
  index: number;
  text: string;
};

export function truncateText(text: string, max = MAX_DOC_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP,
): Chunk[] {
  const clean = text.replace(/\r\n/g, '\n').trim();
  if (!clean) return [];
  const size = Math.max(100, chunkSize);
  const ov = Math.max(0, Math.min(overlap, size - 1));
  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;
  while (start < clean.length) {
    const end = Math.min(clean.length, start + size);
    chunks.push({ index, text: clean.slice(start, end) });
    index += 1;
    if (end >= clean.length) break;
    start = end - ov;
  }
  return chunks;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

export function scoreChunk(queryTokens: string[], chunkTextValue: string): number {
  if (queryTokens.length === 0) return 0;
  const hay = new Set(tokenize(chunkTextValue));
  let hits = 0;
  for (const t of queryTokens) {
    if (hay.has(t)) hits += 1;
  }
  return hits / queryTokens.length;
}

export function retrieveTopChunks(
  question: string,
  chunks: Chunk[],
  topK = TOP_K,
): Chunk[] {
  const tokens = tokenize(question);
  return [...chunks]
    .map((c) => ({ c, score: scoreChunk(tokens, c.text) }))
    .sort((a, b) => b.score - a.score || a.c.index - b.c.index)
    .slice(0, Math.max(1, topK))
    .filter((x) => x.score > 0 || chunks.length <= topK)
    .map((x) => x.c);
}

export function isTextLikeFilename(name: string): boolean {
  return /\.(txt|md|markdown|pdf)$/i.test(name);
}

export const SAMPLE_DOC = `Vercel Blob stores files with put(), list(), and del().
Public blobs get CDN URLs. Keep BLOB_READ_WRITE_TOKEN on the server.
Client uploads should request a short-lived token from your API.
AI Gateway routes model calls with AI_GATEWAY_API_KEY and never invents replies when missing.`;
