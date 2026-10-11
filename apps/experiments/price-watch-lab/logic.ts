export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_WATCH = "Acme USB-C hub · current $49 · target $35 · url https://example.com/hub";
export function parsePrice(text: string): number | null {
  const m = text.replace(/,/g, '').match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  return m ? Number(m[1]) : null;
}
