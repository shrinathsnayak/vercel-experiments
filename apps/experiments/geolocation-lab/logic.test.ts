import { describe, expect, it } from 'vitest';
import { buildLocalizedDemo, extractGeoHeaders } from './logic';

describe('geolocation-lab', () => {
  it('extracts vercel geo headers', () => {
    const geo = extractGeoHeaders(
      new Headers({
        'x-vercel-ip-country': 'DE',
        'x-vercel-ip-city': 'Berlin',
        'x-vercel-ip-timezone': 'Europe/Berlin',
      }),
    );
    expect(geo['x-vercel-ip-country']).toBe('DE');
    expect(geo['x-vercel-ip-city']).toBe('Berlin');
  });

  it('builds localized demo with EUR for DE', () => {
    const demo = buildLocalizedDemo({
      'x-vercel-ip-country': 'DE',
      'x-vercel-ip-city': 'Berlin',
      'x-vercel-ip-timezone': 'Europe/Berlin',
    }, new Date('2026-06-15T12:00:00Z'));
    expect(demo.currency).toBe('EUR');
    expect(demo.source).toBe('vercel-headers');
    expect(demo.greeting).toContain('Deutschland');
  });

  it('falls back when headers missing', () => {
    const demo = buildLocalizedDemo({});
    expect(demo.source).toBe('fallback');
    expect(demo.country).toBe('US');
  });
});
