import { describe, expect, it } from 'vitest';
import { validateNoteBody } from './logic';

describe('neon-postgres-lab logic', () => {
  it('validates note bodies', () => {
    expect(validateNoteBody('')).toBeTruthy();
    expect(validateNoteBody('hello')).toBeNull();
    expect(validateNoteBody('x'.repeat(281))).toBeTruthy();
  });
});
