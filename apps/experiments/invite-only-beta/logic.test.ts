import { describe, expect, it } from 'vitest';
import { isSeedCode, normalizeCode, isValidEmail } from './logic';

describe('invite-only-beta logic', () => {
  it('normalizes codes', () => {
    expect(normalizeCode(' beta acme ')).toBe('BETA-ACME');
  });
  it('validates seeds and emails', () => {
    expect(isSeedCode('BETA-SHIP')).toBe(true);
    expect(isSeedCode('NOPE')).toBe(false);
    expect(isValidEmail('a@b.co')).toBe(true);
  });
});
