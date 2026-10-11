import { describe, expect, it } from 'vitest';
import { clampVoiceResult, truncateText } from './logic';

describe('voice-notes-lab logic', () => {
  it('truncates transcript', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(50), 8).length).toBe(8);
  });

  it('clamps chapters and actions', () => {
    const result = clampVoiceResult({
      summary: '  Overview  ',
      chapters: Array.from({ length: 12 }, (_, i) => ({
        title: ` c${i} `,
        startHint: '0:00',
        summary: 's',
      })),
      actions: ['  a1  ', '', 'a2', ...Array.from({ length: 12 }, () => 'x')],
    });
    expect(result.summary).toBe('Overview');
    expect(result.chapters).toHaveLength(8);
    expect(result.chapters[0]?.title).toBe('c0');
    expect(result.actions.length).toBeLessThanOrEqual(10);
    expect(result.actions[0]).toBe('a1');
  });
});
