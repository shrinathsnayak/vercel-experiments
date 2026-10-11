export type AbVariant = 'A' | 'B';

export type AbAssignment = {
  variant: AbVariant;
  sticky: boolean;
};

export function assignAb(input: {
  existing?: string | null;
  random: number;
  trafficToB?: number; // 0-1
}): AbAssignment {
  if (input.existing === 'A' || input.existing === 'B') {
    return { variant: input.existing, sticky: true };
  }
  const p = input.trafficToB ?? 0.5;
  return { variant: input.random < p ? 'B' : 'A', sticky: false };
}

export type FunnelStats = {
  impressions: Record<AbVariant, number>;
  conversions: Record<AbVariant, number>;
};

export function emptyFunnel(): FunnelStats {
  return { impressions: { A: 0, B: 0 }, conversions: { A: 0, B: 0 } };
}

export function recordEvent(stats: FunnelStats, variant: AbVariant, type: 'impression' | 'conversion'): FunnelStats {
  const next: FunnelStats = {
    impressions: { ...stats.impressions },
    conversions: { ...stats.conversions },
  };
  if (type === 'impression') next.impressions[variant] += 1;
  else next.conversions[variant] += 1;
  return next;
}

export function conversionRate(stats: FunnelStats, variant: AbVariant): number {
  const imp = stats.impressions[variant];
  if (imp === 0) return 0;
  return stats.conversions[variant] / imp;
}

export function abSnippet(): string {
  return `// proxy / middleware
const variant = request.cookies.get('ab')?.value ?? (Math.random() < 0.5 ? 'A' : 'B');
// rewrite to /exp/A or /exp/B and set sticky cookie
// log impression + conversion in Redis or memory`;
}
