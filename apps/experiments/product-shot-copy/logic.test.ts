import { describe, expect, it } from 'vitest';
import { clampCopy, ogQuery } from './logic';

describe('product-shot-copy logic', () => {
  it('clamps copy', () => {
    const c = clampCopy({ title: '  T  ', tagline: 'tag', bullets: ['a', '', 'b'] });
    expect(c.title).toBe('T');
    expect(c.bullets).toEqual(['a', 'b']);
  });
  it('builds og query', () => {
    expect(ogQuery({ title: 'A', tagline: 'B', bullets: [] })).toContain('title=A');
  });
});
