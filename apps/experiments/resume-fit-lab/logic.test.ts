import { describe, expect, it } from 'vitest';
import { clampScore, normalizeFitResult, truncateText } from './logic';

describe('resume-fit-lab logic', () => {
  it('clamps scores', () => {
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(140)).toBe(100);
    expect(clampScore(72.4)).toBe(72);
  });

  it('truncates fields', () => {
    expect(truncateText(' ab ')).toBe('ab');
    expect(truncateText('x'.repeat(50), 10).length).toBe(10);
  });

  it('normalizes fit result lengths', () => {
    const result = normalizeFitResult({
      matchScore: 101,
      missingSkills: Array.from({ length: 20 }, (_, i) => `s${i}`),
      strengths: ['a'],
      rewrittenBullets: Array.from({ length: 10 }, (_, i) => `b${i}`),
    });
    expect(result.matchScore).toBe(100);
    expect(result.missingSkills).toHaveLength(12);
    expect(result.rewrittenBullets).toHaveLength(8);
  });
});
