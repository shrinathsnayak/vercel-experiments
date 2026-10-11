import { describe, expect, it } from 'vitest';
import { clampClusters, parseIdeaLines, voteKey } from './logic';

describe('feature-request-board logic', () => {
  it('parses idea lines', () => {
    expect(parseIdeaLines('  - one\n* two\n\n')).toEqual(['one', 'two']);
  });
  it('clamps clusters', () => {
    const out = clampClusters(
      Array.from({ length: 12 }, (_, i) => ({
        id: ` c${i} `,
        theme: ' t ',
        summary: ' s ',
        ideaIndexes: [0, -1, 1],
      })),
    );
    expect(out).toHaveLength(8);
    expect(out[0]?.ideaIndexes).toEqual([0, 1]);
  });
  it('builds vote keys', () => {
    expect(voteKey('alpha')).toBe('frb:votes:alpha');
  });
});
