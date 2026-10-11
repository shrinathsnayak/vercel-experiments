import { describe, expect, it } from 'vitest';
import { formatBytes, nextImageUrl, rawAssetUrl } from './logic';

describe('image-cdn-compare logic', () => {
  it('builds urls and formats bytes', () => {
    expect(rawAssetUrl('http://localhost:3010', '/demo-hero.svg')).toBe(
      'http://localhost:3010/demo-hero.svg',
    );
    expect(nextImageUrl('http://localhost:3010', '/demo-hero.svg', 640, 75)).toContain(
      '/_next/image?',
    );
    expect(formatBytes(2048)).toBe('2.0 KB');
  });
});
