import { describe, expect, it } from 'vitest';
import { computeStreak } from './logic';
describe('habit-tracker-lite', () => {
  it('computes streak', () => {
    expect(computeStreak(['2026-10-10', '2026-10-11', '2026-10-12'])).toBe(3);
    expect(computeStreak(['2026-10-10', '2026-10-12'])).toBe(1);
  });
});