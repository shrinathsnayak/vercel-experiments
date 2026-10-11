import { describe, expect, it } from 'vitest';
import { clampNote, normalizeTenant, resolveTenant } from './logic';

describe('multi-tenant-notes logic', () => {
  it('normalizes tenant', () => {
    expect(normalizeTenant(' Acme Corp! ')).toBe('acmecorp');
  });
  it('resolves tenant precedence', () => {
    expect(resolveTenant({ header: 'a', query: 'b', body: 'c' })).toBe('a');
    expect(resolveTenant({ query: 'b' })).toBe('b');
    expect(resolveTenant({})).toBeNull();
  });
  it('clamps notes', () => {
    expect(clampNote('  x  ')).toBe('x');
  });
});
