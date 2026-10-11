export const CATALOG_KEY = 'experiments:swr-shop:catalog';
export const DEFAULT_MAX_AGE = 10;
export const DEFAULT_SWR = 30;

export type CatalogItem = {
  id: string;
  name: string;
  stock: number;
};

export type FreshnessEvent = {
  at: string;
  state: 'miss' | 'fresh' | 'stale' | 'revalidating';
  note: string;
};

export function cacheControlHeader(maxAge = DEFAULT_MAX_AGE, swr = DEFAULT_SWR): string {
  return `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`;
}

export function seedCatalog(now = Date.now()): CatalogItem[] {
  return [
    { id: 'sku-1', name: 'Cache Cap', stock: 12 + (now % 5) },
    { id: 'sku-2', name: 'SWR Socks', stock: 40 + (now % 7) },
    { id: 'sku-3', name: 'Origin Tee', stock: 7 + (now % 3) },
  ];
}

export function freshnessLabel(ageSeconds: number, maxAge: number, swr: number): FreshnessEvent['state'] {
  if (ageSeconds < 0) return 'miss';
  if (ageSeconds <= maxAge) return 'fresh';
  if (ageSeconds <= maxAge + swr) return 'stale';
  return 'miss';
}

export function simulateSwrTimeline(
  maxAge: number,
  swr: number,
  ticks: number,
  secondsPerTick: number,
): Array<{ tick: number; age: number; state: FreshnessEvent['state']; note: string }> {
  const out = [];
  let cachedAt = -1;
  for (let tick = 1; tick <= ticks; tick += 1) {
    const now = (tick - 1) * secondsPerTick;
    if (cachedAt < 0) {
      cachedAt = now;
      out.push({ tick, age: 0, state: 'miss' as const, note: 'Cold miss populates cache.' });
      continue;
    }
    const age = now - cachedAt;
    const state = freshnessLabel(age, maxAge, swr);
    let note = '';
    if (state === 'fresh') note = `Fresh (age ${age}s ≤ ${maxAge}s).`;
    else if (state === 'stale') {
      note = `Stale-while-revalidate window (age ${age}s). Serving stale + background refresh.`;
      if (age === maxAge + 1) cachedAt = now;
    } else {
      note = 'Beyond SWR window — origin required.';
      cachedAt = now;
    }
    out.push({ tick, age, state: state === 'miss' && age > 0 ? 'revalidating' : state, note });
  }
  return out;
}
