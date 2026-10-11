import { describe, expect, it } from 'vitest';
import { parseIngredients } from './logic';
describe('recipe-from-fridge', () => {
  it('parses ingredients', () => {
    expect(parseIngredients('Eggs, cheese\nEggs')).toEqual(['eggs', 'cheese']);
  });
});