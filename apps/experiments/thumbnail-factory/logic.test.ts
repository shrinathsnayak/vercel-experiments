import { describe, expect, it } from 'vitest';
import { batchUrls, normalizeTheme, normalizeTitle } from './logic';

describe('thumbnail-factory logic', () => {
  it('normalizes', () => {
    expect(normalizeTitle('  Hi  ')).toBe('Hi');
    expect(normalizeTheme('nope')).toBe('slate');
  });
  it('builds batch urls', () => {
    const urls = batchUrls('http://x', 'A', 'ocean');
    expect(urls).toHaveLength(3);
    expect(urls[0]?.url).toContain('title=A');
  });
});
