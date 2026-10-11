import { describe, expect, it } from 'vitest';
import { clampUrls, extractMeta, heuristicRewrite, isHttpUrl } from './logic';

describe('link-preview-enricher logic', () => {
  it('validates and clamps urls', () => {
    expect(isHttpUrl('https://a.com')).toBe(true);
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(clampUrls(['https://a.com', 'https://a.com', 'https://b.com', '', 'x'])).toEqual([
      'https://a.com',
      'https://b.com',
      'x',
    ]);
  });

  it('extracts meta and rewrites title', () => {
    const html = `<html><head><title>Hello</title>
      <meta property="og:title" content="OG Hello" />
      <meta name="description" content="A page" />
    </head></html>`;
    const meta = extractMeta(html, 'https://example.com/x');
    expect(meta.title).toBe('OG Hello');
    expect(meta.description).toBe('A page');
    expect(heuristicRewrite(meta)).toContain('example.com');
  });
});
