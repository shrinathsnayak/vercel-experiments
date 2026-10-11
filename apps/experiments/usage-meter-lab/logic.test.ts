import { describe, expect, it } from 'vitest';
import { evaluateMeter, HARD_LIMIT, SOFT_LIMIT } from './logic';

describe('usage-meter-lab logic', () => {
  it('evaluates soft and hard', () => {
    expect(evaluateMeter(SOFT_LIMIT, 's').softExceeded).toBe(true);
    expect(evaluateMeter(HARD_LIMIT, 's').hardExceeded).toBe(true);
    expect(evaluateMeter(1, 's').remainingHard).toBe(HARD_LIMIT - 1);
  });
});
