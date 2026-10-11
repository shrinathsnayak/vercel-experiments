export const MAX_JSON_CHARS = 20_000;

export type DiffLine = { kind: 'same' | 'add' | 'del'; text: string };

export function truncateText(text: string, max = MAX_JSON_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

/** Deterministic heuristics for common broken JSON (trailing commas, single quotes, bare keys). */
export function heuristicRepair(input: string): { repaired: string; notes: string[] } {
  const notes: string[] = [];
  let s = input.trim();
  if (!s) return { repaired: s, notes: ['Empty input'] };

  const singleQuoted = s.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, inner) => {
    notes.push('Converted single-quoted string to double quotes');
    return `"${String(inner).replace(/"/g, '\\"')}"`;
  });
  if (singleQuoted !== s) s = singleQuoted;

  const bareKeys = s.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, (_, a, key, c) => {
    notes.push(`Quoted bare key: ${key}`);
    return `${a}"${key}"${c}`;
  });
  if (bareKeys !== s) s = bareKeys;

  const noTrailing = s.replace(/,(\s*[}\]])/g, (_, close) => {
    notes.push('Removed trailing comma');
    return close;
  });
  if (noTrailing !== s) s = noTrailing;

  return { repaired: s, notes: [...new Set(notes)] };
}

export function tryParseJson(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Parse error' };
  }
}

export function lineDiff(before: string, after: string): DiffLine[] {
  const a = before.split(/\n/);
  const b = after.split(/\n/);
  const max = Math.max(a.length, b.length);
  const out: DiffLine[] = [];
  for (let i = 0; i < max; i += 1) {
    const left = a[i];
    const right = b[i];
    if (left === right) {
      if (left !== undefined) out.push({ kind: 'same', text: left });
    } else {
      if (left !== undefined) out.push({ kind: 'del', text: left });
      if (right !== undefined) out.push({ kind: 'add', text: right });
    }
  }
  return out;
}

export function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export const SAMPLE_BROKEN = `{
  name: 'Vercel',
  tags: ['isr', 'edge',],
  nested: { ok: true, },
}`;
