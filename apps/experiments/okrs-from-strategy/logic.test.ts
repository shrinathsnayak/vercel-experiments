import { describe, expect, it } from 'vitest';
import { validateOkrShape } from './logic';
describe('okrs-from-strategy', () => {
  it('validates shape', () => {
    expect(validateOkrShape({ objectives: [{ objective: 'x' }] })).toBe(true);
    expect(validateOkrShape({})).toBe(false);
  });
});