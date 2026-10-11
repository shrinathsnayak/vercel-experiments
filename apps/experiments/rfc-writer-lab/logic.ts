export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_PROBLEM = "We need a shared feature-flag evaluation path across Edge and Node runtimes without duplicating targeting rules.";
export function scaffoldSections(titles: string[]): Array<{ title: string; body: string }> {
  return titles.map((title) => ({ title, body: '' }));
}
