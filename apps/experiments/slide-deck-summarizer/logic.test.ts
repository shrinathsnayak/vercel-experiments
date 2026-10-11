import { describe, expect, it } from 'vitest';
import { isSupportedFilename, splitSlides, truncateText } from './logic';

describe('slide-deck-summarizer logic', () => {
  it('truncates text', () => {
    expect(truncateText('  hi  ')).toBe('hi');
  });

  it('detects filenames', () => {
    expect(isSupportedFilename('deck.pdf')).toBe(true);
    expect(isSupportedFilename('deck.docx')).toBe(false);
  });

  it('splits slides on delimiters', () => {
    const slides = splitSlides('A\n---\nB\n---\nC');
    expect(slides).toEqual(['A', 'B', 'C']);
  });
});
