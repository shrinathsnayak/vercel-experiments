import { describe, expect, it } from 'vitest';
import { parsePrice } from './logic';
describe('price-watch-lab', () => {
  it('parses prices', () => {
    expect(parsePrice('now $49 target $35')).toBe(49);
    expect(parsePrice('no price')).toBeNull();
  });
});