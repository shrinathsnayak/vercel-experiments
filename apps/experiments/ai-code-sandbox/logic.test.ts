import { describe, expect, it } from 'vitest';
import { parseAllowlistedArithmetic } from './logic';

describe('parseAllowlistedArithmetic', () => {
  it('evaluates basic arithmetic', () => {
    expect(parseAllowlistedArithmetic('2+3*4')).toEqual({
      ok: true,
      value: 14,
      normalized: '2+3*4',
    });
  });

  it('respects parentheses and unary minus', () => {
    const result = parseAllowlistedArithmetic('-(1 + 2)');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(-3);
  });

  it('rejects identifiers', () => {
    expect(parseAllowlistedArithmetic('alert(1)').ok).toBe(false);
    expect(parseAllowlistedArithmetic('foo + 1').ok).toBe(false);
  });

  it('rejects division by zero', () => {
    expect(parseAllowlistedArithmetic('1/0').ok).toBe(false);
  });
});
