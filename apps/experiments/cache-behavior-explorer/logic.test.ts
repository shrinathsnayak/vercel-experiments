import { describe, expect, it } from 'vitest';
import { cacheHeaderForStrategy, simulateCacheTimeline } from './logic';

describe('cacheHeaderForStrategy', () => {
  it('returns no-store for no-store strategy', () => {
    expect(cacheHeaderForStrategy('no-store')).toBe('no-store');
  });
});

describe('simulateCacheTimeline', () => {
  it('marks second request fresh under max-age-short', () => {
    const timeline = simulateCacheTimeline('max-age-short', 3, 5);
    expect(timeline[0]?.state).toBe('miss');
    expect(timeline[1]?.state).toBe('fresh');
  });
});
