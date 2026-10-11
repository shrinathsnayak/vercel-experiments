import { describe, expect, it } from 'vitest';
import { parseAmounts, parsePeople, splitEvenly } from './logic';
describe('budget-split-lab', () => {
  it('splits evenly', () => {
    expect(splitEvenly(90, 3)).toBe(30);
    expect(parseAmounts('12.5 food 7 tip')).toEqual([12.5, 7]);
    expect(parsePeople('People: Ada, Grace')).toEqual(['Ada', 'Grace']);
  });
});