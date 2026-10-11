export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_EXPENSES = "42.50 dinner\n18.00 rideshare\n12.75 snacks\nPeople: Ada, Grace, Linus";
export function parseAmounts(text: string): number[] {
  const amounts: number[] = [];
  for (const m of text.matchAll(/(\d+(?:\.\d{1,2})?)/g)) {
    amounts.push(Number(m[1]));
  }
  return amounts;
}
export function splitEvenly(total: number, people: number): number {
  if (people <= 0) return 0;
  return Math.round((total / people) * 100) / 100;
}
export function parsePeople(text: string): string[] {
  const line = text.split(/\n/).find((l) => /people:/i.test(l));
  if (!line) return ['Person A', 'Person B'];
  return line.replace(/people:/i, '').split(',').map((s) => s.trim()).filter(Boolean);
}
