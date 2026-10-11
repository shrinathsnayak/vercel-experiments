import { describe, expect, it } from 'vitest';
import { estimateCostUsd, truncateText } from './logic';

describe('cost-aware-ai-lab logic', () => {
  it('estimates cost from tokens', () => {
    const cost = estimateCostUsd('openai/gpt-4o-mini', 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(0.75, 5);
    expect(estimateCostUsd('openai/gpt-4o-mini', null, 10)).toBeNull();
  });

  it('truncates prompt', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(20), 5).length).toBe(5);
  });
});
