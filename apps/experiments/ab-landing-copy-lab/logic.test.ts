import { describe, expect, it } from 'vitest';
import { assignBucket, conversionRate, emptyStats, record, truncateText } from './logic';

describe('ab-landing-copy-lab logic', () => {
  it('keeps sticky bucket', () => {
    expect(assignBucket('A', 0.9)).toEqual({ bucket: 'A', sticky: true });
    expect(assignBucket(null, 0.1).bucket).toBe('A');
    expect(assignBucket(null, 0.6).bucket).toBe('B');
  });

  it('records funnel and rates', () => {
    let s = emptyStats();
    s = record(s, 'A', 'impression');
    s = record(s, 'A', 'impression');
    s = record(s, 'A', 'conversion');
    expect(conversionRate(s, 'A')).toBe(0.5);
    expect(conversionRate(s, 'B')).toBe(0);
  });

  it('truncates topic', () => {
    expect(truncateText('  hi  ')).toBe('hi');
  });
});
