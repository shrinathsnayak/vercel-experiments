export const MAX_SAMPLE_CHARS = 20_000;

export type SchemaOutput = {
  typescript: string;
  zod: string;
  notes: string[];
};

export function truncateText(text: string, max = MAX_SAMPLE_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

/** Detect rough format for prompt hints - does not invent fields. */
export function detectSampleKind(sample: string): 'json' | 'csv' | 'unknown' {
  const t = sample.trim();
  if (!t) return 'unknown';
  if (t.startsWith('{') || t.startsWith('[')) return 'json';
  if (t.includes(',') && t.includes('\n')) return 'csv';
  return 'unknown';
}

export function clampSchema(output: SchemaOutput): SchemaOutput {
  return {
    typescript: output.typescript.trim(),
    zod: output.zod.trim(),
    notes: output.notes.map((n) => n.trim()).filter(Boolean).slice(0, 8),
  };
}

export function downloadText(filename: string, content: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const SAMPLE_JSON = `{
  "id": "usr_1",
  "email": "ada@example.com",
  "roles": ["admin", "editor"],
  "profile": { "name": "Ada", "active": true },
  "createdAt": "2026-01-10T12:00:00.000Z"
}`;

export const SAMPLE_CSV = `sku,units,price
EDGE-1,12,4.5
NEON-2,3,9.0`;
