import { describe, expect, it } from 'vitest';
import { applyRedirects, defaultRedirects, toVercelJson } from './logic';

describe('cdn-redirects-lab', () => {
  it('matches exact redirects', () => {
    const m = applyRedirects(defaultRedirects, '/docs');
    expect(m.matched).toBe(true);
    expect(m.destination).toBe('/docs/getting-started');
    expect(m.status).toBe(307);
  });

  it('expands :path*', () => {
    const m = applyRedirects(defaultRedirects, '/blog/hello');
    expect(m.destination).toBe('/news/hello');
    expect(m.status).toBe(308);
  });

  it('exports vercel.json shape', () => {
    const json = JSON.parse(toVercelJson(defaultRedirects));
    expect(json.redirects).toHaveLength(3);
    expect(json.redirects[0].source).toBe('/docs');
  });
});
