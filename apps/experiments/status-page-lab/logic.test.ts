import { describe, expect, it } from 'vitest';
import {
  clampHistory,
  isHttpUrl,
  overallFromHistory,
  uptimePercent,
  type CheckResult,
} from './logic';

function check(ok: boolean, i: number): CheckResult {
  return {
    id: String(i),
    url: 'https://example.com',
    ok,
    status: ok ? 200 : 500,
    latencyMs: 10,
    checkedAt: new Date().toISOString(),
  };
}

describe('status-page-lab logic', () => {
  it('validates urls and clamps history', () => {
    expect(isHttpUrl('https://example.com')).toBe(true);
    expect(isHttpUrl('ftp://x')).toBe(false);
    expect(clampHistory(Array.from({ length: 50 }, (_, i) => check(true, i)))).toHaveLength(40);
  });

  it('derives overall status and uptime', () => {
    expect(overallFromHistory([])).toBe('unknown');
    expect(overallFromHistory([check(true, 0), check(true, 1)])).toBe('operational');
    expect(overallFromHistory([check(false, 0), check(false, 1)])).toBe('down');
    expect(overallFromHistory([check(true, 0), check(false, 1)])).toBe('degraded');
    expect(uptimePercent([check(true, 0), check(false, 1)])).toBe(50);
  });
});
