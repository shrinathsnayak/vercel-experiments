export const MAX_NOTES_CHARS = 10_000;
export const MAX_CARDS = 12;

export type Flashcard = {
  front: string;
  back: string;
};

export function truncateText(text: string, max = MAX_NOTES_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampCards(cards: Flashcard[]): Flashcard[] {
  return cards.slice(0, MAX_CARDS).map((c) => ({
    front: c.front.trim(),
    back: c.back.trim(),
  }));
}

export function downloadJson(filename: string, data: unknown) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const SAMPLE_NOTES = `Cache-Control: public, s-maxage=60, stale-while-revalidate=300
ISR regenerates pages in the background after the revalidate window.
Suspense lets streaming SSR send a shell first, then fill in slow data.`;
