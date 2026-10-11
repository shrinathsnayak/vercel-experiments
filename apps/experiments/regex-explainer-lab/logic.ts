export const MAX_PATTERN_CHARS = 500;
export const MAX_TEST_CHARS = 8_000;
export const MAX_MATCHES = 50;

export type HighlightSpan = {
  start: number;
  end: number;
  text: string;
  index: number;
};

export type HighlightResult = {
  ok: boolean;
  error?: string;
  matches: HighlightSpan[];
  flags: string;
};

export function truncateText(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function normalizeFlags(flags: string): string {
  const allowed = new Set(['g', 'i', 'm', 's', 'u', 'y', 'd']);
  const unique = [...new Set(flags.replace(/\s/g, '').split(''))].filter((c) =>
    allowed.has(c),
  );
  if (!unique.includes('g')) unique.push('g');
  return unique.sort().join('');
}

/** Pure highlighting - no AI. Caps matches for UI safety. */
export function highlightMatches(
  pattern: string,
  testString: string,
  flags = 'g',
): HighlightResult {
  const trimmedPattern = pattern.trim();
  if (!trimmedPattern) {
    return { ok: false, error: 'Pattern is required.', matches: [], flags: '' };
  }
  if (trimmedPattern.length > MAX_PATTERN_CHARS) {
    return {
      ok: false,
      error: `Pattern exceeds ${MAX_PATTERN_CHARS} characters.`,
      matches: [],
      flags: '',
    };
  }

  const normalizedFlags = normalizeFlags(flags);
  let re: RegExp;
  try {
    re = new RegExp(trimmedPattern, normalizedFlags);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Invalid regular expression.',
      matches: [],
      flags: normalizedFlags,
    };
  }

  const input = testString.slice(0, MAX_TEST_CHARS);
  const matches: HighlightSpan[] = [];
  let m: RegExpExecArray | null;
  let guard = 0;
  while ((m = re.exec(input)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    matches.push({ start, end, text: m[0], index: matches.length });
    if (m[0].length === 0) {
      re.lastIndex += 1;
    }
    guard += 1;
    if (matches.length >= MAX_MATCHES || guard > MAX_MATCHES + 5) break;
  }

  return { ok: true, matches, flags: normalizedFlags };
}

export function renderHighlightedHtml(testString: string, matches: HighlightSpan[]): string {
  const input = testString.slice(0, MAX_TEST_CHARS);
  if (matches.length === 0) return escapeHtml(input);

  const sorted = [...matches].sort((a, b) => a.start - b.start);
  let cursor = 0;
  let out = '';
  for (const match of sorted) {
    if (match.start < cursor) continue;
    out += escapeHtml(input.slice(cursor, match.start));
    out += `<mark data-match="${match.index}">${escapeHtml(match.text)}</mark>`;
    cursor = match.end;
  }
  out += escapeHtml(input.slice(cursor));
  return out;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export const SAMPLE_PATTERN = String.raw`\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b`;
export const SAMPLE_TEST =
  'Ada Lovelace met Charles Babbage in London. The Analytical Engine was never completed.';
export const SAMPLE_FLAGS = 'g';
