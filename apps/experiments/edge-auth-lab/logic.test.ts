import { describe, expect, it } from 'vitest';
import { classifySkew } from './logic';

describe('edge-auth-lab', () => {
  it('allows within tolerance', () => {
    expect(
      classifySkew({ nowSeconds: 1000, iat: 990, exp: 1060, clockToleranceSeconds: 5 }),
    ).toBe('valid');
  });

  it('detects expired past tolerance', () => {
    expect(
      classifySkew({ nowSeconds: 1100, iat: 1000, exp: 1060, clockToleranceSeconds: 5 }),
    ).toBe('expired');
  });

  it('detects not-yet-valid', () => {
    expect(
      classifySkew({ nowSeconds: 1000, iat: 1020, exp: 1100, clockToleranceSeconds: 5 }),
    ).toBe('not-yet-valid');
  });
});
