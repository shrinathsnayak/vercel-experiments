import { describe, expect, it } from 'vitest';
import { clampMatch, MAX_FIELDS, truncateText, type MatchResult } from './logic';

describe('invoice-matcher-lab logic', () => {
  it('truncates docs', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(40), 10).length).toBe(10);
  });

  it('clamps fields and confidence', () => {
    const result: MatchResult = {
      overallConfidence: 1.5,
      summary: ' ok ',
      fields: Array.from({ length: MAX_FIELDS + 2 }, (_, i) => ({
        field: ` f${i} `,
        invoiceValue: 'a',
        poValue: 'b',
        status: 'mismatch' as const,
        confidence: -0.2,
      })),
    };
    const clamped = clampMatch(result);
    expect(clamped.fields).toHaveLength(MAX_FIELDS);
    expect(clamped.overallConfidence).toBe(1);
    expect(clamped.fields[0].confidence).toBe(0);
    expect(clamped.fields[0].field).toBe('f0');
    expect(clamped.summary).toBe('ok');
  });
});
