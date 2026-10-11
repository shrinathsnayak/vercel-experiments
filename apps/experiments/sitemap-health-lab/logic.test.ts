import { describe, expect, it } from 'vitest';
import {
  clampSample,
  extractSitemapLocs,
  isHttpUrl,
  summarizeChecks,
} from './logic';

describe('sitemap-health-lab logic', () => {
  it('clamps sample size and validates urls', () => {
    expect(clampSample(0)).toBe(1);
    expect(clampSample(100)).toBe(15);
    expect(isHttpUrl('https://example.com/a')).toBe(true);
  });

  it('extracts loc urls and summarizes checks', () => {
    const xml = `<?xml version="1.0"?>
      <urlset>
        <url><loc>https://a.com/1</loc></url>
        <url><loc>https://a.com/2</loc></url>
        <url><loc>ftp://bad</loc></url>
      </urlset>`;
    expect(extractSitemapLocs(xml, 10)).toEqual([
      'https://a.com/1',
      'https://a.com/2',
    ]);
    const summary = summarizeChecks([
      { url: 'https://a.com/1', status: 200, ok: true, ms: 100 },
      { url: 'https://a.com/2', status: 404, ok: false, ms: 200 },
    ]);
    expect(summary).toEqual({ ok: 1, failed: 1, avgMs: 150 });
  });
});
