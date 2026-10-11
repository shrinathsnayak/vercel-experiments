export const MAX_CONTRACT_CHARS = 20_000;
export const MAX_ROWS = 24;

export type ClauseRow = {
  kind: 'risk' | 'obligation' | 'date' | 'other';
  title: string;
  summary: string;
  excerpt: string;
  party?: string;
  dateOrDeadline?: string;
};

export function truncateText(text: string, max = MAX_CONTRACT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function isTextLikeFilename(name: string): boolean {
  return /\.(txt|md|markdown|pdf)$/i.test(name);
}

export function clampClauses(rows: ClauseRow[]): ClauseRow[] {
  return rows.slice(0, MAX_ROWS).map((r) => ({
    kind: r.kind,
    title: r.title.trim(),
    summary: r.summary.trim(),
    excerpt: r.excerpt.trim().slice(0, 400),
    party: r.party?.trim() || undefined,
    dateOrDeadline: r.dateOrDeadline?.trim() || undefined,
  }));
}

export function downloadJson(filename: string, data: unknown) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const SAMPLE_CONTRACT = `MASTER SERVICES AGREEMENT

1. Term. This Agreement begins on January 15, 2026 and continues for twelve (12) months unless terminated earlier.

2. Payment. Customer shall pay invoices within thirty (30) days of receipt. Late amounts accrue 1.5% interest per month.

3. Liability Cap. Provider's aggregate liability shall not exceed fees paid in the prior twelve months. Neither party is liable for consequential damages.

4. Termination. Either party may terminate for material breach if uncured within 15 days of written notice. Customer may terminate for convenience with 30 days notice.

5. Confidentiality. Each party shall protect Confidential Information for three (3) years after termination.`;
