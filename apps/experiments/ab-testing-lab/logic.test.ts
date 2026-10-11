import { describe, expect, it } from 'vitest';
import { assignAb, conversionRate, emptyFunnel, recordEvent } from './logic';

describe('ab-testing-lab', () => {
  it('sticky cookie wins', () => {
    expect(assignAb({ existing: 'B', random: 0 }).variant).toBe('B');
  });

  it('tracks conversion rate', () => {
    let s = emptyFunnel();
    s = recordEvent(s, 'A', 'impression');
    s = recordEvent(s, 'A', 'impression');
    s = recordEvent(s, 'A', 'conversion');
    expect(conversionRate(s, 'A')).toBe(0.5);
  });
});
