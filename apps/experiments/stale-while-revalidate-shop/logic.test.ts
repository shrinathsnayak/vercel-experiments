import { describe, expect, it } from 'vitest';
import { cacheControlHeader, freshnessLabel, simulateSwrTimeline } from './logic';

describe('stale-while-revalidate-shop logic', () => {
  it('builds SWR header and timeline', () => {
    expect(cacheControlHeader(10, 30)).toContain('stale-while-revalidate=30');
    expect(freshnessLabel(5, 10, 30)).toBe('fresh');
    expect(freshnessLabel(15, 10, 30)).toBe('stale');
    expect(simulateSwrTimeline(10, 30, 4, 8).length).toBe(4);
  });
});
