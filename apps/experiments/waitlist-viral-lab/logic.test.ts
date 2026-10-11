import { describe, expect, it } from 'vitest';
import {
  assignPosition,
  boostPosition,
  buildDripPreview,
  isValidEmail,
  makeReferralCode,
  normalizeEmail,
} from './logic';

describe('waitlist-viral-lab logic', () => {
  it('normalizes and validates email', () => {
    expect(normalizeEmail('  Alex@Acme.io ')).toBe('alex@acme.io');
    expect(isValidEmail('alex@acme.io')).toBe(true);
    expect(isValidEmail('nope')).toBe(false);
  });

  it('builds stable referral codes and positions', () => {
    expect(makeReferralCode('alex@acme.io')).toHaveLength(8);
    expect(makeReferralCode('alex@acme.io')).toBe(makeReferralCode('alex@acme.io'));
    expect(assignPosition(3)).toBe(4);
    expect(boostPosition(10, 3)).toBe(7);
    expect(boostPosition(2, 10)).toBe(1);
  });

  it('builds drip preview messages', () => {
    const drip = buildDripPreview({
      email: 'a@b.co',
      position: 12,
      referralCode: 'ABCD1234',
    });
    expect(drip).toHaveLength(3);
    expect(drip[0]?.subject).toContain('list');
    expect(drip[2]?.body).toContain('ABCD1234');
  });
});
