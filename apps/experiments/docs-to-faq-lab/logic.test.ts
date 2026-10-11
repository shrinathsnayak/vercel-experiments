import { describe, expect, it } from 'vitest';
import { cacheKey, clampFaq, MAX_FAQ_PAIRS, truncateText } from './logic';

describe('docs-to-faq-lab logic', () => {
  it('truncates docs', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(40), 10).length).toBe(10);
  });

  it('clamps FAQ pairs', () => {
    const pairs = Array.from({ length: MAX_FAQ_PAIRS + 2 }, (_, i) => ({
      question: ` q${i} `,
      answer: ` a${i} `,
    }));
    const clamped = clampFaq(pairs);
    expect(clamped).toHaveLength(MAX_FAQ_PAIRS);
    expect(clamped[0].question).toBe('q0');
  });

  it('builds cache key', () => {
    expect(cacheKey('abc')).toBe('experiments:docs-to-faq:abc');
  });
});
