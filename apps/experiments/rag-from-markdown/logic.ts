export const MAX_TOTAL_CHARS = 60_000;
export const MAX_FILES = 8;
export const DEFAULT_CHUNK_SIZE = 700;
export const DEFAULT_CHUNK_OVERLAP = 80;
export const TOP_K = 5;

export type MdFile = { name: string; content: string };

export type SourceChunk = {
  id: string;
  file: string;
  index: number;
  text: string;
};

export function truncateText(text: string, max = MAX_TOTAL_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function chunkMarkdownFiles(
  files: MdFile[],
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP,
): SourceChunk[] {
  const size = Math.max(100, chunkSize);
  const ov = Math.max(0, Math.min(overlap, size - 1));
  const out: SourceChunk[] = [];
  for (const file of files.slice(0, MAX_FILES)) {
    const clean = file.content.replace(/\r\n/g, '\n').trim();
    if (!clean) continue;
    let start = 0;
    let index = 0;
    while (start < clean.length) {
      const end = Math.min(clean.length, start + size);
      out.push({
        id: `${file.name}#${index}`,
        file: file.name,
        index,
        text: clean.slice(start, end),
      });
      index += 1;
      if (end >= clean.length) break;
      start = end - ov;
    }
  }
  return out;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

export function scoreChunk(queryTokens: string[], chunkText: string): number {
  if (queryTokens.length === 0) return 0;
  const hay = new Set(tokenize(chunkText));
  let hits = 0;
  for (const t of queryTokens) if (hay.has(t)) hits += 1;
  return hits / queryTokens.length;
}

export function retrieveTopChunks(
  question: string,
  chunks: SourceChunk[],
  topK = TOP_K,
): SourceChunk[] {
  const tokens = tokenize(question);
  return [...chunks]
    .map((c) => ({ c, score: scoreChunk(tokens, c.text) }))
    .sort((a, b) => b.score - a.score || a.c.file.localeCompare(b.c.file) || a.c.index - b.c.index)
    .slice(0, Math.max(1, topK))
    .filter((x) => x.score > 0 || chunks.length <= topK)
    .map((x) => x.c);
}

export const SAMPLE_FILES: MdFile[] = [
  {
    name: 'isr.md',
    content:
      '# ISR\n\nIncremental Static Regeneration revalidates pages after a time window.\nUse export const revalidate = 60 and on-demand revalidatePath for product pages.',
  },
  {
    name: 'blob.md',
    content:
      '# Blob\n\nVercel Blob stores files with put(), list(), and del().\nKeep BLOB_READ_WRITE_TOKEN on the server only.',
  },
];

export const SAMPLE_QUESTION = 'How do I revalidate a product page?';
