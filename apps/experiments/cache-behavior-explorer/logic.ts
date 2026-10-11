export type CacheStrategy =
  | 'no-store'
  | 'max-age-short'
  | 'max-age-long'
  | 'stale-while-revalidate';

export type CacheState = 'miss' | 'fresh' | 'stale' | 'revalidating';

export type SimulatedRequest = {
  step: number;
  state: CacheState;
  ageSeconds: number;
  note: string;
};

const STRATEGY_CONFIG: Record<
  CacheStrategy,
  { maxAge: number; swr: number; label: string }
> = {
  'no-store': { maxAge: 0, swr: 0, label: 'Cache-Control: no-store' },
  'max-age-short': { maxAge: 10, swr: 0, label: 'Cache-Control: max-age=10' },
  'max-age-long': { maxAge: 120, swr: 0, label: 'Cache-Control: max-age=120' },
  'stale-while-revalidate': { maxAge: 10, swr: 30, label: 'max-age=10, stale-while-revalidate=30' },
};

export function getStrategyLabel(strategy: CacheStrategy): string {
  return STRATEGY_CONFIG[strategy].label;
}

export function cacheHeaderForStrategy(strategy: CacheStrategy): string {
  const cfg = STRATEGY_CONFIG[strategy];
  if (strategy === 'no-store') return 'no-store';
  if (strategy === 'stale-while-revalidate') {
    return `public, max-age=${cfg.maxAge}, stale-while-revalidate=${cfg.swr}`;
  }
  return `public, max-age=${cfg.maxAge}`;
}

/** Deterministic state machine for educational simulation (not CDN telemetry). */
export function simulateCacheTimeline(
  strategy: CacheStrategy,
  requestCount: number,
  secondsBetweenRequests: number,
): SimulatedRequest[] {
  const cfg = STRATEGY_CONFIG[strategy];
  const timeline: SimulatedRequest[] = [];
  let cachedAt = -1;

  for (let i = 0; i < requestCount; i += 1) {
    const now = i * secondsBetweenRequests;
    let state: CacheState = 'miss';
    let note = 'Origin fetch - nothing cached yet.';

    if (strategy === 'no-store') {
      state = 'miss';
      note = 'no-store: every request hits origin.';
    } else if (cachedAt < 0) {
      cachedAt = now;
      state = 'miss';
      note = 'First request populates cache.';
    } else {
      const age = now - cachedAt;
      if (age <= cfg.maxAge) {
        state = 'fresh';
        note = `Served from cache (age ${age}s ≤ max-age ${cfg.maxAge}s).`;
      } else if (strategy === 'stale-while-revalidate' && age <= cfg.maxAge + cfg.swr) {
        state = 'revalidating';
        note = `Stale response served while background revalidation runs (age ${age}s).`;
        if (age === cfg.maxAge + 1 || i === requestCount - 1) {
          cachedAt = now;
        }
      } else {
        state = 'miss';
        cachedAt = now;
        note = 'Cache expired - origin fetch required.';
      }
    }

    timeline.push({
      step: i + 1,
      state,
      ageSeconds: cachedAt >= 0 ? Math.max(0, now - cachedAt) : 0,
      note,
    });
  }

  return timeline;
}
