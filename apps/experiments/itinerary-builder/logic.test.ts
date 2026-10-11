import { describe, expect, it } from 'vitest';
import { clampDays, inferDays } from './logic';
describe('itinerary-builder', () => {
  it('clamps days', () => {
    expect(clampDays(0)).toBe(1);
    expect(clampDays(99)).toBe(14);
    expect(inferDays('Paris 5 days')).toBe(5);
  });
});