export type IsrFreshnessState = 'fresh' | 'stale' | 'revalidating';

export type IsrTimelineEntry = {
  tick: number;
  elapsedSeconds: number;
  state: IsrFreshnessState;
  note: string;
};

export function revalidateAfter(seconds: number): { revalidate: number } {
  const revalidate = Math.max(0, Math.floor(seconds));
  return { revalidate };
}

export function getFreshnessState(
  generatedAtSeconds: number,
  nowSeconds: number,
  revalidateSec: number,
  revalidating: boolean,
): IsrFreshnessState {
  if (revalidating) return 'revalidating';
  const age = nowSeconds - generatedAtSeconds;
  if (revalidateSec <= 0) return 'stale';
  if (age < revalidateSec) return 'fresh';
  return 'stale';
}

/** Educational ISR state machine - not platform telemetry. */
export function simulateIsrTimeline(
  revalidateSec: number,
  tickCount: number,
  secondsPerTick: number,
  options?: { onDemandTick?: number },
): IsrTimelineEntry[] {
  const entries: IsrTimelineEntry[] = [];
  let generatedAt = 0;
  let revalidating = false;

  for (let tick = 1; tick <= tickCount; tick += 1) {
    const elapsed = (tick - 1) * secondsPerTick;
    const onDemand = options?.onDemandTick === tick;

    if (onDemand) {
      generatedAt = elapsed;
      revalidating = false;
    }

    let state = getFreshnessState(generatedAt, elapsed, revalidateSec, revalidating);
    let note = '';

    if (tick === 1) {
      note = 'Static page generated at build or first request.';
    } else if (onDemand) {
      note = 'On-demand revalidate: cache entry regenerated now.';
    } else if (state === 'fresh') {
      note = `Served from cache (age ${elapsed - generatedAt}s < revalidate ${revalidateSec}s).`;
    } else if (state === 'stale') {
      note = `Stale static HTML (age ${elapsed - generatedAt}s ≥ revalidate). Next request may trigger background regeneration.`;
      if (revalidateSec > 0 && tick < tickCount) {
        revalidating = true;
        state = 'revalidating';
        note = 'Background revalidation in progress - stale page may still be served.';
        generatedAt = elapsed;
        revalidating = false;
      }
    } else {
      note = 'Regenerating static payload in the background.';
    }

    entries.push({ tick, elapsedSeconds: elapsed, state, note });
  }

  return entries;
}

export function onDemandRevalidate(generatedAtSeconds: number, nowSeconds: number): number {
  return nowSeconds >= generatedAtSeconds ? nowSeconds : generatedAtSeconds;
}

export function isrRouteExample(revalidateSec: number): string {
  return `// app/blog/[slug]/page.tsx
export const revalidate = ${revalidateSec};

export default async function Page() {
  const posts = await fetchPosts();
  return <ArticleList posts={posts} />;
}`;
}
