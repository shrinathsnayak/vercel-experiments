import { describe, expect, it } from 'vitest';
import {
  chunkText,
  retrieveTopChunks,
  scoreChunk,
  tokenize,
} from './logic';

describe('chat-with-your-pdf logic', () => {
  it('chunks with overlap', () => {
    const text = 'a'.repeat(500);
    const chunks = chunkText(text, 200, 50);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].index).toBe(0);
    expect(chunks[0].text.length).toBe(200);
  });

  it('tokenizes and scores overlap', () => {
    expect(tokenize('Hello AI Gateway')).toEqual(['hello', 'gateway']);
    expect(scoreChunk(['blob', 'cdn'], 'blob storage and cdn urls')).toBe(1);
    expect(scoreChunk(['zzz'], 'no match here')).toBe(0);
  });

  it('retrieves top keyword chunks', () => {
    const chunks = chunkText(
      'Alpha section about cats. ' + 'pad '.repeat(40) + 'Beta section about dogs and kennels.',
      80,
      10,
    );
    const top = retrieveTopChunks('dogs kennels', chunks, 2);
    expect(top.some((c) => c.text.includes('dogs'))).toBe(true);
  });
});
