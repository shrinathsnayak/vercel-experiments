import { describe, expect, it } from 'vitest';
import { clampTopN, isHttpUrl, parseFeedItems } from './logic';

describe('rss-digest-lab logic', () => {
  it('clamps topN and validates urls', () => {
    expect(clampTopN(0)).toBe(1);
    expect(clampTopN(99)).toBe(10);
    expect(isHttpUrl('https://x.com/feed')).toBe(true);
  });

  it('parses RSS items', () => {
    const xml = `<?xml version="1.0"?><rss><channel>
      <item><title>One</title><link>https://a.com/1</link><description>Hello</description></item>
      <item><title>Two</title><link>https://a.com/2</link><description>World</description></item>
    </channel></rss>`;
    const items = parseFeedItems(xml, 1);
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('One');
    expect(items[0]?.summary).toContain('Hello');
  });
});
