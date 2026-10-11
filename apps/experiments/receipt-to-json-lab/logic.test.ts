import { describe, expect, it } from 'vitest';
import {
  expenseToJson,
  isImageFilename,
  truncateText,
  type Expense,
} from './logic';

const sample: Expense = {
  merchant: 'ACME',
  date: '2026-03-15',
  currency: 'USD',
  total: 12.1,
  lineItems: [
    { description: 'Latte', quantity: 1, unitPrice: 4.5, total: 4.5 },
  ],
};

describe('receipt-to-json-lab logic', () => {
  it('detects image filenames', () => {
    expect(isImageFilename('scan.png')).toBe(true);
    expect(isImageFilename('note.txt')).toBe(false);
  });

  it('truncates receipt text', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(9000), 100).length).toBe(100);
  });

  it('serializes expense JSON', () => {
    const json = expenseToJson(sample);
    expect(json).toContain('"merchant": "ACME"');
    expect(JSON.parse(json).total).toBe(12.1);
  });
});
