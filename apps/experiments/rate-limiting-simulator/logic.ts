export type RateLimitAlgorithm = 'fixed-window' | 'sliding-window' | 'token-bucket' | 'leaky-bucket';

export type RateLimitConfig = {
  limit: number;
  windowMs: number;
  burst?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
};

export type RateLimiter = {
  check: (now: number, key?: string) => RateLimitResult;
  reset: () => void;
};

export function createFixedWindowLimiter(config: RateLimitConfig): RateLimiter {
  let windowStart = 0;
  let count = 0;
  return {
    check(now: number) {
      if (now - windowStart >= config.windowMs) {
        windowStart = now;
        count = 0;
      }
      if (count >= config.limit) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterMs: config.windowMs - (now - windowStart),
        };
      }
      count += 1;
      return { allowed: true, remaining: config.limit - count };
    },
    reset() {
      windowStart = 0;
      count = 0;
    },
  };
}

export function createSlidingWindowLimiter(config: RateLimitConfig): RateLimiter {
  const timestamps: number[] = [];
  return {
    check(now: number) {
      const windowStart = now - config.windowMs;
      while (timestamps.length > 0 && timestamps[0]! < windowStart) {
        timestamps.shift();
      }
      if (timestamps.length >= config.limit) {
        const retryAfterMs = timestamps[0]! + config.windowMs - now;
        return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, retryAfterMs) };
      }
      timestamps.push(now);
      return { allowed: true, remaining: config.limit - timestamps.length };
    },
    reset() {
      timestamps.length = 0;
    },
  };
}

export function createTokenBucketLimiter(config: RateLimitConfig): RateLimiter {
  const burst = config.burst ?? config.limit;
  const refillRate = config.limit / config.windowMs;
  let tokens = burst;
  let last: number | null = null;
  return {
    check(now: number) {
      if (last !== null) {
        const elapsed = now - last;
        tokens = Math.min(burst, tokens + elapsed * refillRate);
      }
      last = now;
      if (tokens < 1) {
        const retryAfterMs = Math.ceil((1 - tokens) / refillRate);
        return { allowed: false, remaining: 0, retryAfterMs };
      }
      tokens -= 1;
      return { allowed: true, remaining: Math.floor(tokens) };
    },
    reset() {
      tokens = burst;
      last = null;
    },
  };
}

export function createLeakyBucketLimiter(config: RateLimitConfig): RateLimiter {
  const burst = config.burst ?? config.limit;
  const leakRate = config.limit / config.windowMs;
  let volume = 0;
  let last: number | null = null;
  return {
    check(now: number) {
      if (last !== null) {
        const elapsed = now - last;
        volume = Math.max(0, volume - elapsed * leakRate);
      }
      last = now;
      if (volume >= burst) {
        const retryAfterMs = Math.ceil((volume - burst + 1) / leakRate);
        return { allowed: false, remaining: 0, retryAfterMs };
      }
      volume += 1;
      return { allowed: true, remaining: Math.max(0, Math.floor(burst - volume)) };
    },
    reset() {
      volume = 0;
      last = null;
    },
  };
}

export function createLimiter(
  algorithm: RateLimitAlgorithm,
  config: RateLimitConfig,
): RateLimiter {
  switch (algorithm) {
    case 'fixed-window':
      return createFixedWindowLimiter(config);
    case 'sliding-window':
      return createSlidingWindowLimiter(config);
    case 'token-bucket':
      return createTokenBucketLimiter(config);
    case 'leaky-bucket':
      return createLeakyBucketLimiter(config);
    default:
      return createFixedWindowLimiter(config);
  }
}

/** Run a burst of requests at fixed intervals for visualization. */
export function simulateRequests(
  limiter: RateLimiter,
  count: number,
  startMs: number,
  intervalMs: number,
): Array<{ index: number; at: number; result: RateLimitResult }> {
  const results: Array<{ index: number; at: number; result: RateLimitResult }> = [];
  for (let i = 0; i < count; i += 1) {
    const at = startMs + i * intervalMs;
    results.push({ index: i + 1, at, result: limiter.check(at) });
  }
  return results;
}
