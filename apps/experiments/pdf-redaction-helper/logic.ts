export const MAX_TEXT = 12_000;
export const REDACTION_CAVEAT =
  'Suggestions only. This is not perfect redaction — always human-review before sharing.';

export type PiiSpan = {
  type: string;
  text: string;
  start: number;
  end: number;
};

export function truncateText(text: string): string {
  return text.trim().slice(0, MAX_TEXT);
}

export function clampSpans(spans: PiiSpan[], source: string): PiiSpan[] {
  return spans
    .map((s) => ({
      type: s.type.trim().slice(0, 40),
      text: s.text.trim().slice(0, 200),
      start: Math.max(0, Math.min(source.length, Math.floor(s.start))),
      end: Math.max(0, Math.min(source.length, Math.floor(s.end))),
    }))
    .filter((s) => s.end > s.start)
    .slice(0, 40);
}

/** Deterministic email/phone hints for tests + UI preview (not complete PII detection). */
export function heuristicSpans(text: string): PiiSpan[] {
  const spans: PiiSpan[] = [];
  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  let m: RegExpExecArray | null;
  while ((m = email.exec(text))) {
    spans.push({ type: 'email', text: m[0], start: m.index, end: m.index + m[0].length });
  }
  return spans.slice(0, 20);
}

export const SAMPLE_TEXT =
  'Please call Jane Doe at +1-415-555-0134 or email jane.doe@acme-widgets.io about SSN 123-45-6789.';
