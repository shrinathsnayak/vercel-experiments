import { describe, expect, it } from 'vitest';
import {
  clampDiff,
  extractTitle,
  isHttpUrl,
  stripHtmlToText,
  truncateText,
} from './logic';

describe('competitor-page-diff logic', () => {
  it('validates urls and extracts title/text', () => {
    expect(isHttpUrl('https://a.com')).toBe(true);
    expect(isHttpUrl('ftp://a.com')).toBe(false);
    const html =
      '<html><head><title>Acme</title></head><body><p>Hello</p></body></html>';
    expect(extractTitle(html)).toBe('Acme');
    expect(stripHtmlToText(html)).toContain('Hello');
  });

  it('truncates and clamps diff arrays', () => {
    expect(truncateText('x'.repeat(20), 10)).toHaveLength(10);
    const clamped = clampDiff({
      sharedThemes: [' a ', '', 'b'],
      aOnly: Array.from({ length: 12 }, (_, i) => `a${i}`),
      bOnly: ['b'],
      positioningNotes: ['n'],
    });
    expect(clamped.sharedThemes).toEqual(['a', 'b']);
    expect(clamped.aOnly).toHaveLength(8);
  });
});
