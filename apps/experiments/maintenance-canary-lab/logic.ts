export type CanaryConfig = {
  maintenanceMode: boolean;
  canaryPercent: number; // 0-100
};

export type Assignment = {
  variant: 'control' | 'canary';
  cookieValue: string;
  reason: 'existing-cookie' | 'new-assignment' | 'maintenance';
};

export function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function assignVariant(input: {
  config: CanaryConfig;
  existingCookie?: string | null;
  random: number; // 0..1
}): Assignment {
  if (input.config.maintenanceMode) {
    return { variant: 'control', cookieValue: 'maintenance', reason: 'maintenance' };
  }
  const existing = input.existingCookie?.trim();
  if (existing === 'control' || existing === 'canary') {
    return { variant: existing, cookieValue: existing, reason: 'existing-cookie' };
  }
  const percent = clampPercent(input.config.canaryPercent);
  const variant = input.random * 100 < percent ? 'canary' : 'control';
  return { variant, cookieValue: variant, reason: 'new-assignment' };
}

export function shouldShowMaintenance(config: CanaryConfig): boolean {
  return config.maintenanceMode === true;
}

export function maintenanceSnippet(): string {
  return `// proxy.ts (or middleware)
const maintenance = process.env.MAINTENANCE_MODE === 'true';
// or read Global Config key maintenanceMode
if (maintenance) return NextResponse.rewrite(new URL('/maintenance', request.url));
// sticky canary cookie for percentage rollout`;
}
