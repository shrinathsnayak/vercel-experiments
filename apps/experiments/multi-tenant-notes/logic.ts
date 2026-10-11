export const MAX_NOTE = 2_000;
export const MAX_TENANT = 64;

export type Note = { id: string; tenant: string; text: string; createdAt: string };

export function normalizeTenant(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, MAX_TENANT);
}

export function clampNote(text: string): string {
  return text.trim().slice(0, MAX_NOTE);
}

export function resolveTenant(input: { header?: string | null; query?: string | null; body?: string | null }): string | null {
  const raw = input.header || input.query || input.body || '';
  const t = normalizeTenant(raw);
  return t || null;
}

export const SAMPLE_TENANT = 'acme';
export const SAMPLE_NOTE = 'Draft launch checklist for Q4.';
