import { describe, expect, it } from 'vitest';
import { normalizeHistory, truncateText } from './logic';
describe('tutor-chat-lab', () => {
  it('truncates', () => { expect(truncateText('abcdef', 3)).toBe('abc'); });
  it('normalizes history', () => {
    expect(normalizeHistory([{ role: 'user', content: 'Hi' }, { role: 'system', content: 'x' }])).toHaveLength(1);
  });
});