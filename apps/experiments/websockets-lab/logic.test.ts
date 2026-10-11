import { describe, expect, it } from 'vitest';
import { formatSseEvent, recommendTransport } from './logic';

describe('websockets-lab', () => {
  it('recommends external WS for bidirectional', () => {
    expect(recommendTransport(true, true)).toBe('external-ws');
  });

  it('formats SSE frames', () => {
    expect(formatSseEvent('tick', { n: 1 }, '1')).toContain('event: tick');
    expect(formatSseEvent('tick', { n: 1 }, '1')).toContain('data: {"n":1}');
  });
});
