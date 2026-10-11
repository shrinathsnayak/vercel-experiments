import { describe, expect, it } from 'vitest';
import { clampMessages, deterministicDigest, truncateText, type InboxMessage } from './logic';

const sample: InboxMessage = {
  id: '1',
  from: 'a@b.co',
  subject: 'Hi',
  body: 'Hello world',
  receivedAt: '2026-10-12T00:00:00.000Z',
};

describe('inbox-digest-cron logic', () => {
  it('truncates and clamps', () => {
    expect(truncateText('  x  ')).toBe('x');
    expect(clampMessages(Array.from({ length: 50 }, (_, i) => ({ ...sample, id: String(i) })))).toHaveLength(40);
  });

  it('builds deterministic digest', () => {
    const text = deterministicDigest([sample]);
    expect(text).toContain('1 message');
    expect(text).toContain('Hi');
    expect(deterministicDigest([])).toMatch(/empty/i);
  });
});
