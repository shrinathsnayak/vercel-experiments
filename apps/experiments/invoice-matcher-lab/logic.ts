export const MAX_DOC_CHARS = 12_000;
export const MAX_FIELDS = 20;

export type MatchStatus = 'match' | 'mismatch' | 'missing';

export type MatchField = {
  field: string;
  invoiceValue: string;
  poValue: string;
  status: MatchStatus;
  confidence: number;
  note?: string;
};

export type MatchResult = {
  overallConfidence: number;
  fields: MatchField[];
  summary: string;
};

export function truncateText(text: string, max = MAX_DOC_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampMatch(result: MatchResult): MatchResult {
  const fields = result.fields.slice(0, MAX_FIELDS).map((f) => ({
    field: f.field.trim(),
    invoiceValue: f.invoiceValue.trim(),
    poValue: f.poValue.trim(),
    status: f.status,
    confidence: Math.min(1, Math.max(0, f.confidence)),
    note: f.note?.trim() || undefined,
  }));
  return {
    overallConfidence: Math.min(1, Math.max(0, result.overallConfidence)),
    fields,
    summary: result.summary.trim(),
  };
}

export const SAMPLE_INVOICE = `INVOICE #INV-1042
Vendor: Acme Supplies LLC
PO Reference: PO-7781
Ship to: 120 Edge Ave
Line: Widget A x 10 @ $12.00 = $120.00
Tax: $9.60
Total due: $129.60
Due: 2026-04-01`;

export const SAMPLE_PO = `PURCHASE ORDER PO-7781
Buyer: Contoso Labs
Vendor: Acme Supplies LLC
Ship to: 120 Edge Ave
Line: Widget A x 10 @ $12.00 = $120.00
Tax: $9.60
Total authorized: $129.60
Need by: 2026-03-28`;
