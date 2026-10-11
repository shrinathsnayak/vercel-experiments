import { describe, expect, it } from 'vitest';
import { clampMessages, ttlVisualization, truncateText, type ChatMessage } from './logic';

describe('memory-thread-lab logic', () => {
  it('truncates and clamps turns', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    const msgs: ChatMessage[] = Array.from({ length: 30 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: String(i),
      at: new Date().toISOString(),
    }));
    expect(clampMessages(msgs)).toHaveLength(24);
  });

  it('visualizes TTL', () => {
    expect(ttlVisualization(null, null).label).toMatch(/No TTL/);
    const expiresAt = new Date(Date.now() + 90_000).toISOString();
    const viz = ttlVisualization(900, expiresAt);
    expect(viz.remainingSeconds).toBeGreaterThan(80);
    expect(viz.label).toMatch(/TTL/);
  });
});
