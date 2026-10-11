import { describe, expect, it } from 'vitest';
import {
  clampAdvice,
  normalizeRobotsUrl,
  parseRobotsRules,
  truncateText,
} from './logic';

describe('robots-policy-advisor logic', () => {
  it('normalizes robots urls and truncates', () => {
    expect(normalizeRobotsUrl('https://example.com')).toBe(
      'https://example.com/robots.txt',
    );
    expect(normalizeRobotsUrl('https://example.com/robots.txt')).toBe(
      'https://example.com/robots.txt',
    );
    expect(truncateText('  hi  ')).toBe('hi');
  });

  it('parses allow/deny/sitemap and clamps advice', () => {
    const parsed = parseRobotsRules(`User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://example.com/sitemap.xml`);
    expect(parsed.allows).toContain('/');
    expect(parsed.denies).toContain('/api/');
    expect(parsed.sitemaps[0]).toContain('sitemap.xml');
    const advice = clampAdvice({
      allows: [' / ', ''],
      denies: Array.from({ length: 20 }, (_, i) => `/${i}`),
      suggestions: ['a'],
      summary: 'ok',
    });
    expect(advice.allows).toEqual(['/']);
    expect(advice.denies).toHaveLength(12);
  });
});
