export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const MAX_INGREDIENTS = 40;
export const SAMPLE_INGREDIENTS = "eggs, cheddar, spinach, tortilla, salsa, leftover rice";
export function parseIngredients(text: string): string[] {
  const raw = truncateText(text).split(/[,\n;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  return [...new Set(raw)].slice(0, MAX_INGREDIENTS);
}
