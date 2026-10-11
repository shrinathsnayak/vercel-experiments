import { describe, expect, it } from 'vitest';
import { clampTriage, truncateText } from './logic';

describe('github-issue-triage logic', () => {
  it('truncates fields', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(20), 5)).toHaveLength(5);
  });

  it('clamps triage result', () => {
    const result = clampTriage({
      labels: [' Bug ', 'needs triage', ''],
      severity: 'high',
      firstResponse: 'Thanks',
      clarifyingQuestions: Array.from({ length: 10 }, (_, i) => `q${i}`),
    });
    expect(result.labels).toEqual(['bug', 'needs-triage']);
    expect(result.clarifyingQuestions).toHaveLength(6);
  });
});
