import { describe, expect, it } from 'vitest';
import { chunkMarkdownFiles, retrieveTopChunks, SAMPLE_FILES } from './logic';

describe('rag-from-markdown logic', () => {
  it('chunks multiple files with source labels', () => {
    const chunks = chunkMarkdownFiles(SAMPLE_FILES);
    expect(chunks.some((c) => c.file === 'isr.md')).toBe(true);
    expect(chunks.some((c) => c.file === 'blob.md')).toBe(true);
  });

  it('retrieves ISR chunks for revalidate questions', () => {
    const chunks = chunkMarkdownFiles(SAMPLE_FILES);
    const top = retrieveTopChunks('revalidate product page', chunks, 2);
    expect(top[0]?.file).toBe('isr.md');
  });
});
