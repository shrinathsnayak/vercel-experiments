import { describe, expect, it } from 'vitest';
import {
  createFixedWindowLimiter,
  createLeakyBucketLimiter,
  createSlidingWindowLimiter,
  createTokenBucketLimiter,
  simulateRequests,
} from './logic';

describe('fixed window', () => {
  it('allows up to limit then rejects', () => {
    const limiter = createFixedWindowLimiter({ limit: 2, windowMs: 1000 });
    expect(limiter.check(0).allowed).toBe(true);
    expect(limiter.check(0).allowed).toBe(true);
    expect(limiter.check(0).allowed).toBe(false);
    expect(limiter.check(1000).allowed).toBe(true);
  });
});

describe('sliding window', () => {
  it('rejects when window is full', () => {
    const limiter = createSlidingWindowLimiter({ limit: 2, windowMs: 100 });
    expect(limiter.check(0).allowed).toBe(true);
    expect(limiter.check(50).allowed).toBe(true);
    expect(limiter.check(60).allowed).toBe(false);
    expect(limiter.check(110).allowed).toBe(true);
  });
});

describe('token bucket', () => {
  it('permits burst then throttles', () => {
    const limiter = createTokenBucketLimiter({ limit: 10, windowMs: 1000, burst: 3 });
    expect(limiter.check(0).allowed).toBe(true);
    expect(limiter.check(0).allowed).toBe(true);
    expect(limiter.check(0).allowed).toBe(true);
    expect(limiter.check(0).allowed).toBe(false);
  });
});

describe('leaky bucket', () => {
  it('drains over time', () => {
    const limiter = createLeakyBucketLimiter({ limit: 60, windowMs: 60000, burst: 2 });
    expect(limiter.check(0).allowed).toBe(true);
    expect(limiter.check(0).allowed).toBe(true);
    expect(limiter.check(0).allowed).toBe(false);
    expect(limiter.check(2000).allowed).toBe(true);
  });
});

describe('simulateRequests', () => {
  it('returns deterministic series', () => {
    const limiter = createFixedWindowLimiter({ limit: 1, windowMs: 100 });
    const series = simulateRequests(limiter, 3, 0, 50);
    expect(series.filter((s) => s.result.allowed).length).toBe(2);
  });
});
