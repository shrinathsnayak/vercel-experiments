export const MAX_DDL_CHARS = 10_000;
export const MAX_QUESTION_CHARS = 2_000;

export type SqlDraft = {
  sql: string;
  explanation: string;
  params: string[];
  unsafe: boolean;
  unsafeReason?: string;
};

export function truncateText(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampSql(draft: SqlDraft): SqlDraft {
  return {
    sql: draft.sql.trim(),
    explanation: draft.explanation.trim(),
    params: draft.params.map((p) => p.trim()).filter(Boolean).slice(0, 20),
    unsafe: Boolean(draft.unsafe),
    unsafeReason: draft.unsafeReason?.trim() || undefined,
  };
}

/** Block obviously destructive statements before optional Neon execution. */
export function isSafeSelect(sql: string): boolean {
  const normalized = sql.trim().replace(/;+\s*$/, '');
  if (!normalized) return false;
  if (normalized.includes(';')) return false;
  const head = normalized.slice(0, 20).toLowerCase();
  return (
    head.startsWith('select') ||
    head.startsWith('with') ||
    head.startsWith('explain')
  );
}

export const SAMPLE_DDL = `CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INT NOT NULL,
  active BOOLEAN DEFAULT true
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  qty INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);`;

export const SAMPLE_QUESTION =
  'List active products with total quantity ordered, highest totals first, limit 10.';

export const DEMO_TABLE_NAMES = ['products', 'orders'] as const;
