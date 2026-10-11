import { describe, expect, it } from 'vitest';
import { clampDiff } from './logic';

describe('before-after-diff-lab logic', () => {
  it('clamps diff', () => {
    const d = clampDiff({ summary: '  s  ', changes: ['a', ''], risks: ['r'] });
    expect(d.summary).toBe('s');
    expect(d.changes).toEqual(['a']);
  });
});
