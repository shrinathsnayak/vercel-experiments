import { describe, expect, it } from 'vitest';
import { checkPassword, contentFor } from './logic';

describe('auth-gated-preview logic', () => {
  it('checks password against default', () => {
    expect(checkPassword('preview')).toBe(true);
    expect(checkPassword('nope')).toBe(false);
  });
  it('switches content', () => {
    expect(contentFor(false).mode).toBe('published');
    expect(contentFor(true).mode).toBe('preview');
  });
});
