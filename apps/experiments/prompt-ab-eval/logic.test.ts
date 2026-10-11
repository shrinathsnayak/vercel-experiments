import { describe, expect, it } from 'vitest';
import { clampScore, truncateText } from './logic';

describe('prompt-ab-eval logic', () => {
  it('clamps scores and truncates', () => {
    expect(clampScore(0)).toBe(1);
    expect(clampScore(9)).toBe(5);
    expect(truncateText('  hi  ', 10)).toBe('hi');
  });
});
