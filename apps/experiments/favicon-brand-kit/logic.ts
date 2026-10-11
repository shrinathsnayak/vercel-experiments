export const ICON_SIZES = [16, 32, 180, 512] as const;

export function normalizeLetter(letter: string): string {
  const t = letter.trim();
  if (!t) return 'V';
  return t.slice(0, 1).toUpperCase();
}

export function normalizeHex(color: string): string | null {
  const c = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(c)) return `#${c.toLowerCase()}`;
  return null;
}

export function contrastingInk(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#0f172a' : '#f8fafc';
}

export function kitUrls(base: string, color: string, letter: string): Array<{ size: number; url: string }> {
  const c = encodeURIComponent(color);
  const l = encodeURIComponent(letter);
  return ICON_SIZES.map((size) => ({
    size,
    url: `${base}/api/icon?color=${c}&letter=${l}&size=${size}`,
  }));
}

export const SAMPLE_COLOR = '#0ea5e9';
export const SAMPLE_LETTER = 'V';
