import { describe, expect, it } from 'vitest';
import { contrastingInk, kitUrls, normalizeHex, normalizeLetter } from './logic';

describe('favicon-brand-kit logic', () => {
  it('normalizes color and letter', () => {
    expect(normalizeHex('#AbcDef')).toBe('#abcdef');
    expect(normalizeHex('bad')).toBeNull();
    expect(normalizeLetter('ve')).toBe('V');
  });
  it('picks contrasting ink', () => {
    expect(contrastingInk('#ffffff')).toBe('#0f172a');
    expect(contrastingInk('#000000')).toBe('#f8fafc');
  });
  it('builds kit urls', () => {
    expect(kitUrls('http://x', '#0ea5e9', 'V')).toHaveLength(4);
  });
});
