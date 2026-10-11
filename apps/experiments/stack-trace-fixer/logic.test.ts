import { describe, expect, it } from 'vitest';
import { clampPlan, detectHints, truncateText } from './logic';

describe('stack-trace-fixer logic', () => {
  it('truncates and detects boundary hints', () => {
    expect(truncateText('  e  ')).toBe('e');
    expect(
      detectHints(
        'Event handlers cannot be passed to Client Component props.',
        'at Home (app/page.tsx:8:17)',
      ),
    ).toContain('server-client-boundary');
  });

  it('clamps fix plan arrays', () => {
    const plan = clampPlan({
      likelyCause: 'boundary',
      nextjsTips: Array.from({ length: 12 }, (_, i) => `t${i}`),
      reproChecklist: ['a', ''],
      docsHints: ['d'],
    });
    expect(plan.nextjsTips).toHaveLength(8);
    expect(plan.reproChecklist).toEqual(['a']);
  });
});
