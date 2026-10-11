export const MAX_PROSE_CHARS = 6_000;

export type FormField = {
  key: string;
  label: string;
  value: string;
  confidence: number;
};

export function truncateText(text: string, max = MAX_PROSE_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampConfidence(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, Math.round(n * 100) / 100));
}

export function heuristicFill(prose: string): FormField[] {
  const email = prose.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? '';
  const phone = prose.match(/\+?[0-9][0-9\-\s()]{7,}[0-9]/)?.[0] ?? '';
  const company = prose.match(/\bat\s+([A-Z][A-Za-z0-9& ]{1,40})/)?.[1]?.trim() ?? '';
  const name = prose.match(/^(?:I(?:'m| am)\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)?.[1] ?? '';
  return [
    { key: 'fullName', label: 'Full name', value: name, confidence: name ? 0.55 : 0.1 },
    { key: 'email', label: 'Email', value: email, confidence: email ? 0.9 : 0.1 },
    { key: 'phone', label: 'Phone', value: phone, confidence: phone ? 0.75 : 0.1 },
    { key: 'company', label: 'Company', value: company, confidence: company ? 0.5 : 0.1 },
    {
      key: 'role',
      label: 'Role',
      value: /engineer|developer|designer|pm|manager/i.exec(prose)?.[0] ?? '',
      confidence: 0.4,
    },
  ];
}

export const SAMPLE_PROSE =
  "Hi — I'm Priya Shah, a product engineer at Northwind Labs. Reach me at priya.shah@northwind.example or +1 (415) 555-0142. Looking to trial edge caching.";
