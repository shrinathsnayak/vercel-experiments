import { describe, expect, it } from 'vitest';
import { defaultZones, resolveZone, zoneRewrites } from './logic';

describe('microfrontends-zones-lab', () => {
  it('resolves longest prefix zone', () => {
    expect(resolveZone('/docs/guide').zone).toBe('docs');
    expect(resolveZone('/app/settings').zone).toBe('app');
  });

  it('builds rewrite map', () => {
    const rewrites = zoneRewrites(defaultZones);
    expect(rewrites.some((r) => r.source.startsWith('/docs'))).toBe(true);
  });
});
