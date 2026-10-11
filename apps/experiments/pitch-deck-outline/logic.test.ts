import { describe, expect, it } from 'vitest';
import { clampSlideCount } from './logic';
describe('pitch-deck-outline', () => {
  it('clamps slides', () => {
    expect(clampSlideCount(2)).toBe(4);
    expect(clampSlideCount(40)).toBe(14);
  });
});