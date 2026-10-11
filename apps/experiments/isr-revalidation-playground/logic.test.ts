import { describe, expect, it } from 'vitest';
import {
  getFreshnessState,
  onDemandRevalidate,
  revalidateAfter,
  simulateIsrTimeline,
} from './logic';

describe('revalidateAfter', () => {
  it('floors and clamps negative values to zero', () => {
    expect(revalidateAfter(30.9)).toEqual({ revalidate: 30 });
    expect(revalidateAfter(-5)).toEqual({ revalidate: 0 });
  });
});

describe('getFreshnessState', () => {
  it('returns fresh within revalidate window', () => {
    expect(getFreshnessState(0, 9, 10, false)).toBe('fresh');
  });

  it('returns stale after window', () => {
    expect(getFreshnessState(0, 10, 10, false)).toBe('stale');
  });

  it('returns revalidating when flag set', () => {
    expect(getFreshnessState(0, 5, 60, true)).toBe('revalidating');
  });
});

describe('onDemandRevalidate', () => {
  it('bumps generated time to now', () => {
    expect(onDemandRevalidate(100, 150)).toBe(150);
  });
});

describe('simulateIsrTimeline', () => {
  it('marks on-demand tick as fresh regeneration', () => {
    const timeline = simulateIsrTimeline(60, 4, 30, { onDemandTick: 3 });
    expect(timeline[2]?.note).toContain('On-demand revalidate');
  });
});
