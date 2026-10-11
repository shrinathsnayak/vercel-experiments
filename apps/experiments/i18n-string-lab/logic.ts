export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_STRINGS = "Welcome back, {name}!\nYou have {count} unread messages.\nSave changes";
export function keyify(label: string): string {
  return label
    .toLowerCase()
    .replace(/\{[^}]+\}/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48) || 'string';
}
export function extractPlaceholders(str: string): string[] {
  return [...str.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
}
