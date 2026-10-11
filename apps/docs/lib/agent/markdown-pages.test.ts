import { describe, expect, it } from 'vitest';
import {
  buildHomeMarkdown,
  buildNotFoundMarkdown,
  getMarketingMarkdown,
  normalizeMarketingPath,
} from './markdown-pages';

describe('normalizeMarketingPath', () => {
  it('normalizes root and trailing slashes', () => {
    expect(normalizeMarketingPath('/')).toBe('/');
    expect(normalizeMarketingPath('')).toBe('/');
    expect(normalizeMarketingPath('/about/')).toBe('/about');
  });
});

describe('getMarketingMarkdown', () => {
  it('returns homepage markdown with product guidance', () => {
    const body = getMarketingMarkdown('/');
    expect(body).toBeTruthy();
    expect(body!).toContain('# Vercel Experiments');
    expect(body!.length).toBeGreaterThan(500);
    expect(body!).toContain('When to use this');
    expect(body!).toContain('/openapi.json');
  });

  it('returns null for unknown paths', () => {
    expect(getMarketingMarkdown('/definitely-missing-page')).toBeNull();
  });
});

describe('buildNotFoundMarkdown', () => {
  it('explains the error and links discovery surfaces', () => {
    const body = buildNotFoundMarkdown('/__ora-404-probe');
    expect(body.length).toBeGreaterThan(20);
    expect(body).toContain('Page not found');
    expect(body).toContain('/llms.txt');
    expect(body).toContain('/sitemap.xml');
    expect(body).toContain('/docs');
  });
});

describe('buildHomeMarkdown', () => {
  it('mentions the public API and developer portal', () => {
    const body = buildHomeMarkdown();
    expect(body).toContain('/api/v1/experiments');
    expect(body).toContain('/developers');
  });
});
