import { describe, expect, it } from 'vitest';
import { buildSitemapXml, defaultContent } from './logic';

describe('cron-sitemap-rebuild logic', () => {
  it('builds sitemap xml', () => {
    const xml = buildSitemapXml('https://example.com', defaultContent());
    expect(xml).toContain('<urlset');
    expect(xml).toContain('https://example.com/docs');
  });
});
