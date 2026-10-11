import { describe, expect, it } from 'vitest';
import {
  buildSizesAttribute,
  compareFormats,
  computeSrcSet,
  estimateBytes,
} from './logic';

describe('estimateBytes', () => {
  it('orders formats avif < webp < jpeg for same inputs', () => {
    const avif = estimateBytes(800, 'avif', 75);
    const webp = estimateBytes(800, 'webp', 75);
    const jpeg = estimateBytes(800, 'jpeg', 75);
    expect(avif).toBeLessThan(webp);
    expect(webp).toBeLessThan(jpeg);
  });
});

describe('computeSrcSet', () => {
  it('builds width descriptors', () => {
    expect(computeSrcSet('/img.png', [640, 1280])).toBe('/img.png?w=640 640w, /img.png?w=1280 1280w');
  });
});

describe('buildSizesAttribute', () => {
  it('includes default 100vw', () => {
    const sizes = buildSizesAttribute([{ minWidth: 768, size: '50vw' }]);
    expect(sizes).toContain('100vw');
    expect(sizes).toContain('768px');
  });
});

describe('compareFormats', () => {
  it('returns three format rows', () => {
    expect(compareFormats(400, 80)).toHaveLength(3);
  });
});
