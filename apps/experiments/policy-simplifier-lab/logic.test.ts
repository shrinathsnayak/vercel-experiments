import { describe, expect, it } from 'vitest';
import { clampSummary, MAX_BULLETS, truncateText, type PolicySummary } from './logic';

describe('policy-simplifier-lab logic', () => {
  it('truncates policy text', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('abcdef', 3)).toBe('abc');
  });

  it('clamps bullets', () => {
    const summary: PolicySummary = {
      plainSummary: ' Summary ',
      bullets: Array.from({ length: MAX_BULLETS + 4 }, (_, i) => ` b${i} `),
      watchOuts: [' w ', ''],
    };
    const clamped = clampSummary(summary);
    expect(clamped.plainSummary).toBe('Summary');
    expect(clamped.bullets).toHaveLength(MAX_BULLETS);
    expect(clamped.bullets[0]).toBe('b0');
    expect(clamped.watchOuts).toEqual(['w']);
  });
});
