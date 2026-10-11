import { describe, expect, it } from 'vitest';
import { spaceDays } from './logic';
describe('email-sequence-lab', () => {
  it('spaces days', () => {
    expect(spaceDays(3, 0)[0]).toBe(0);
    expect(spaceDays(3, 0)).toHaveLength(3);
  });
});