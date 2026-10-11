import { describe, expect, it } from 'vitest';
import { clampRows, flattenPayload } from './logic';

describe('webhook-to-sheet-lab logic', () => {
  it('flattens objects', () => {
    expect(flattenPayload({ a: 1, b: 'x' })).toEqual({ a: '1', b: 'x' });
  });
  it('clamps rows', () => {
    expect(clampRows(Array.from({ length: 50 }, (_, i) => ({
      id: String(i), receivedAt: '', columns: {},
    }))).length).toBe(40);
  });
});
