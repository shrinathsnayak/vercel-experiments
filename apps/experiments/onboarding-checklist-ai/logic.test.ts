import { describe, expect, it } from 'vitest';
import { progressPercent } from './logic';
describe('onboarding-checklist-ai', () => {
  it('computes progress', () => {
    expect(progressPercent(2, 4)).toBe(50);
    expect(progressPercent(0, 0)).toBe(0);
  });
});