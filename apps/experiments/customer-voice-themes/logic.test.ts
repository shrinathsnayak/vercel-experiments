import { describe, expect, it } from 'vitest';
import { chunkFeedback } from './logic';
describe('customer-voice-themes', () => {
  it('chunks feedback', () => {
    expect(chunkFeedback('a\n\nb\nc')).toEqual(['a', 'b', 'c']);
  });
});