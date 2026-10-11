import { describe, expect, it } from 'vitest';
import { truncateText } from './logic';
describe('competitor-battlecard', () => {
  it('truncates', () => expect(truncateText('abcdef', 3)).toBe('abc'));
});