export const HISTORY_KEY = 'experiments:status-page:history';
export const MAX_HISTORY = 40;
export const DEFAULT_CHECK_URL = 'https://example.com';
export const CHECK_TIMEOUT_MS = 8_000;

export type CheckResult = {
  id: string;
  url: string;
  ok: boolean;
  status: number | null;
  latencyMs: number;
  checkedAt: string;
  error?: string;
};

export type OverallStatus = 'operational' | 'degraded' | 'down' | 'unknown';

export function clampHistory(items: CheckResult[]): CheckResult[] {
  return items.slice(0, MAX_HISTORY);
}

export function overallFromHistory(history: CheckResult[]): OverallStatus {
  if (history.length === 0) return 'unknown';
  const recent = history.slice(0, 5);
  const failures = recent.filter((h) => !h.ok).length;
  if (failures === 0) return 'operational';
  if (failures >= recent.length) return 'down';
  return 'degraded';
}

export function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function uptimePercent(history: CheckResult[]): number | null {
  if (history.length === 0) return null;
  const ok = history.filter((h) => h.ok).length;
  return Math.round((ok / history.length) * 1000) / 10;
}
