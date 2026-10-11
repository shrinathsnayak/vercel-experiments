import { describe, expect, it } from 'vitest';
import { normalizeProduct, slugify } from './logic';

describe('og-from-database logic', () => {
  it('slugifies titles', () => {
    expect(slugify('Edge Cache Kit!')).toBe('edge-cache-kit');
  });

  it('normalizes products', () => {
    expect(
      normalizeProduct({ title: ' Hello ', description: ' World ' }),
    ).toEqual({
      slug: 'hello',
      title: 'Hello',
      description: 'World',
    });
    expect(normalizeProduct({ title: '', description: 'x' })).toBeNull();
  });
});
