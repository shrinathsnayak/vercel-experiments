import { describe, expect, it } from 'vitest';
import { extractPlaceholders, keyify } from './logic';
describe('i18n-string-lab', () => {
  it('keyifies and extracts placeholders', () => {
    expect(keyify('Welcome back, {name}!')).toContain('welcome');
    expect(extractPlaceholders('Hi {name}')).toEqual(['name']);
  });
});