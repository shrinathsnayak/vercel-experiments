export const MAX_PAYLOAD_CHARS = 8_000;
export const MAX_ROWS = 40;

export type SheetRow = {
  id: string;
  receivedAt: string;
  columns: Record<string, string>;
};

export function flattenPayload(payload: unknown): Record<string, string> {
  if (payload === null || payload === undefined) return {};
  if (typeof payload !== 'object' || Array.isArray(payload)) {
    return { value: String(payload).slice(0, 500) };
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
    out[k.slice(0, 40)] = typeof v === 'string' ? v.slice(0, 500) : JSON.stringify(v).slice(0, 500);
    if (Object.keys(out).length >= 12) break;
  }
  return out;
}

export function clampRows(rows: SheetRow[]): SheetRow[] {
  return rows.slice(0, MAX_ROWS);
}

export const SAMPLE_PAYLOAD = { event: 'signup', email: 'alex@acme.io', plan: 'pro' };
