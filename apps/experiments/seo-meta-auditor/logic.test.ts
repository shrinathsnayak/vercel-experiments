import { describe, expect, it } from 'vitest';
import {
  buildOgPreviewPath,
  extractMetaSnapshot,
  findMetaGaps,
  isHttpUrl,
} from './logic';

describe('seo-meta-auditor logic', () => {
  it('extracts meta and finds gaps', () => {
    expect(isHttpUrl('https://example.com')).toBe(true);
    const html = `<html><head>
      <title>Short</title>
      <meta name="description" content="A short desc">
      <meta property="og:title" content="OG">
    </head></html>`;
    const meta = extractMetaSnapshot(html);
    expect(meta.title).toBe('Short');
    expect(meta.ogTitle).toBe('OG');
    const gaps = findMetaGaps(meta);
    expect(gaps).toContain('title-too-short');
    expect(gaps).toContain('missing-canonical');
    expect(gaps).toContain('missing-og-image');
  });

  it('builds og preview path', () => {
    expect(buildOgPreviewPath('T', 'D')).toBe('/api/og?title=T&description=D');
  });
});
