import { describe, expect, it } from 'vitest';
import {
  clampPlan,
  extractAuditHints,
  SAMPLE_LIGHTHOUSE,
  truncateText,
} from './logic';

describe('lighthouse-action-plan logic', () => {
  it('truncates and extracts weak audits from sample JSON', () => {
    expect(truncateText('  x  ')).toBe('x');
    const hints = extractAuditHints(SAMPLE_LIGHTHOUSE);
    expect(hints.categories.some((c) => c.id === 'performance')).toBe(true);
    expect(hints.weakAudits.length).toBeGreaterThan(0);
    expect(extractAuditHints('not-json').categories).toEqual([]);
  });

  it('clamps action plan', () => {
    const plan = clampPlan({
      scoreSummary: 'ok',
      fixes: Array.from({ length: 20 }, (_, i) => ({
        priority: 'P1' as const,
        category: 'perf',
        issue: `i${i}`,
        nextjsFix: `f${i}`,
      })),
    });
    expect(plan.fixes).toHaveLength(12);
  });
});
