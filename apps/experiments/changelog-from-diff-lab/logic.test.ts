import { describe, expect, it } from 'vitest';
import { clampChangelog, truncateText } from './logic';

describe('changelog-from-diff-lab logic', () => {
  it('truncates diffs', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(30), 10).length).toBe(10);
  });

  it('clamps changelog arrays', () => {
    const result = clampChangelog({
      customerFacing: [' A ', '', 'B'],
      internalNotes: Array.from({ length: 20 }, (_, i) => ` n${i} `),
    });
    expect(result.customerFacing).toEqual(['A', 'B']);
    expect(result.internalNotes).toHaveLength(12);
    expect(result.internalNotes[0]).toBe('n0');
  });
});
