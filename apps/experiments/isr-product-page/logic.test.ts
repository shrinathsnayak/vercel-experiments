import { describe, expect, it } from 'vitest';
import { getProduct, productPath, PRODUCTS, REVALIDATE_SECONDS } from './logic';

describe('isr-product-page logic', () => {
  it('resolves products and paths', () => {
    expect(PRODUCTS.length).toBeGreaterThan(0);
    expect(getProduct('aurora-mug')?.name).toMatch(/Aurora/);
    expect(productPath('aurora-mug')).toBe('/products/aurora-mug');
    expect(REVALIDATE_SECONDS).toBeGreaterThan(0);
  });
});
