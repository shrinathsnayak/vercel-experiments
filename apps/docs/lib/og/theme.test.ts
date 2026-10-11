import { describe, expect, it } from 'vitest';
import { truncateOgText } from './theme';

describe('truncateOgText', () => {
  it('returns short text unchanged', () => {
    expect(truncateOgText('Queues Lab', 64)).toBe('Queues Lab');
  });

  it('truncates long copy with an ellipsis', () => {
    const value = 'A'.repeat(80);
    const result = truncateOgText(value, 20);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBe(20);
  });
});
