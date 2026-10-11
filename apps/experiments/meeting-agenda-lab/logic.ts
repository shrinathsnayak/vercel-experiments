export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_BRIEF = "30 minutes\nAlign on Q3 launch risks\nDecide owners for docs gap\nParking lot for redesign";
export function allocateMinutes(weights: number[], totalMinutes: number): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / sum) * totalMinutes);
  const floored = raw.map((n) => Math.max(1, Math.floor(n)));
  let rem = totalMinutes - floored.reduce((a, b) => a + b, 0);
  let i = 0;
  while (rem !== 0 && floored.length) {
    const idx = i % floored.length;
    if (rem > 0) { floored[idx] += 1; rem -= 1; }
    else if (floored[idx] > 1) { floored[idx] -= 1; rem += 1; }
    i += 1;
    if (i > 1000) break;
  }
  return floored;
}
