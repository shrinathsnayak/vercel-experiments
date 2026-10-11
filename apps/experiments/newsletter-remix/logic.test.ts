import { describe, expect, it } from 'vitest';
import { countWords, truncateText } from './logic';
describe('newsletter-remix', () => {
  it('counts words', () => {
    expect(countWords('one two three')).toBe(3);
    expect(truncateText('abcdef', 3)).toBe('abc');
  });
});