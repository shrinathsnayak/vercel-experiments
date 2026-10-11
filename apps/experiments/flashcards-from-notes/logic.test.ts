import { describe, expect, it } from 'vitest';
import { clampCards, MAX_CARDS, truncateText } from './logic';

describe('flashcards-from-notes logic', () => {
  it('truncates notes', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(50), 8).length).toBe(8);
  });

  it('clamps card count', () => {
    const cards = Array.from({ length: MAX_CARDS + 5 }, (_, i) => ({
      front: ` f${i} `,
      back: ` b${i} `,
    }));
    const clamped = clampCards(cards);
    expect(clamped).toHaveLength(MAX_CARDS);
    expect(clamped[0].front).toBe('f0');
  });
});
