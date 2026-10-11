export const MAX_RECEIPT_TEXT = 8_000;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Expense = {
  merchant: string;
  date: string;
  currency: string;
  total: number;
  lineItems: LineItem[];
};

export function truncateText(text: string, max = MAX_RECEIPT_TEXT): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function isImageFilename(name: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
}

export function expenseToJson(expense: Expense): string {
  return `${JSON.stringify(expense, null, 2)}\n`;
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

export const SAMPLE_RECEIPT = `ACME Coffee
2026-03-15
Latte x1 4.50
Muffin x2 3.25
Tax 1.10
Total USD 12.10`;
