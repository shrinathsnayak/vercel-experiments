export const COOKIE_NAME = 'ab_landing_bucket';
export const MAX_TOPIC_CHARS = 500;

export type Bucket = 'A' | 'B';

export type Headlines = {
  A: string;
  B: string;
};

export type FunnelStats = {
  impressions: Record<Bucket, number>;
  conversions: Record<Bucket, number>;
};

export function truncateText(text: string, max = MAX_TOPIC_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function emptyStats(): FunnelStats {
  return { impressions: { A: 0, B: 0 }, conversions: { A: 0, B: 0 } };
}

export function assignBucket(existing: string | null | undefined, random: number): {
  bucket: Bucket;
  sticky: boolean;
} {
  if (existing === 'A' || existing === 'B') {
    return { bucket: existing, sticky: true };
  }
  return { bucket: random < 0.5 ? 'A' : 'B', sticky: false };
}

export function record(
  stats: FunnelStats,
  bucket: Bucket,
  type: 'impression' | 'conversion',
): FunnelStats {
  const next: FunnelStats = {
    impressions: { ...stats.impressions },
    conversions: { ...stats.conversions },
  };
  if (type === 'impression') next.impressions[bucket] += 1;
  else next.conversions[bucket] += 1;
  return next;
}

export function conversionRate(stats: FunnelStats, bucket: Bucket): number {
  const imp = stats.impressions[bucket];
  if (!imp) return 0;
  return stats.conversions[bucket] / imp;
}

export const SAMPLE_TOPIC =
  'A serverless status page for indie SaaS founders who ship on Vercel';

export const FALLBACK_HEADLINES: Headlines = {
  A: 'Ship a status page before your next outage',
  B: 'Honest uptime for indie SaaS - live in one afternoon',
};
