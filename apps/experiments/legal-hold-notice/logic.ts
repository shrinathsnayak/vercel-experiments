export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_MATTER = "Matter: Acme v. Example\nCustodians: eng-leads@, support@\nRange: 2024-01-01 to 2024-06-30\nSystems: email, Slack exports, ticketing";
export function buildDisclaimer(): string {
  return 'EDUCATIONAL SAMPLE ONLY — not legal advice. Consult qualified counsel before issuing any real legal hold.';
}
