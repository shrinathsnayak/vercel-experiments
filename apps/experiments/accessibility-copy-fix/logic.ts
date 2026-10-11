export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_COPY = "CLICK HERE to learn more!!! Our NEW AMAZING platform is BETTER than everything. See screenshot (image1.png).";
export function findLocalA11yFlags(text: string): string[] {
  const flags: string[] = [];
  if (/CLICK HERE/i.test(text)) flags.push('Vague link text: "click here"');
  if (/[A-Z]{4,}/.test(text) && text === text.toUpperCase()) flags.push('All-caps copy can be harder to read');
  else if ((text.match(/\b[A-Z]{4,}\b/g) ?? []).length >= 3) flags.push('Excessive uppercase words');
  if (/!!!+/.test(text)) flags.push('Excessive punctuation');
  if (/\.(png|jpg|jpeg|gif|webp)\b/i.test(text) && !/alt/i.test(text)) flags.push('Image filename mentioned without alt guidance');
  return flags;
}
