import { describe, expect, it } from 'vitest';
import { allocateMinutes } from './logic';
describe('meeting-agenda-lab', () => {
  it('allocates minutes', () => {
    const mins = allocateMinutes([1, 1, 1], 30);
    expect(mins.reduce((a, b) => a + b, 0)).toBe(30);
  });
});