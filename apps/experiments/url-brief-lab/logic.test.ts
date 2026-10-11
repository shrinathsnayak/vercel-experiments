import { describe, expect, it } from 'vitest';
import {
  buildOgPreviewPath,
  extractMetaDescription,
  extractTitle,
  isHttpUrl,
  stripHtmlToText,
} from './logic';

describe('url-brief-lab logic', () => {
  it('extracts title and description', () => {
    const html =
      '<html><head><title>Hello</title><meta name="description" content="World"></head><body><p>Hi</p></body></html>';
    expect(extractTitle(html)).toBe('Hello');
    expect(extractMetaDescription(html)).toBe('World');
    expect(stripHtmlToText(html)).toContain('Hi');
  });

  it('validates http(s) urls', () => {
    expect(isHttpUrl('https://example.com')).toBe(true);
    expect(isHttpUrl('ftp://example.com')).toBe(false);
    expect(isHttpUrl('not-a-url')).toBe(false);
  });

  it('builds og preview path', () => {
    expect(buildOgPreviewPath('T', 'D')).toBe('/api/og?title=T&description=D');
  });
});
