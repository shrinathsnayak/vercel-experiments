import { describe, expect, it } from 'vitest';
import {
  numericColumnAggregates,
  parseCsv,
  SAMPLE_CSV,
} from './logic';

describe('csv-insight-lab logic', () => {
  it('parses CSV without inventing rows', () => {
    const table = parseCsv(SAMPLE_CSV);
    expect(table.headers).toEqual(['product', 'units', 'revenue']);
    expect(table.rows).toHaveLength(5);
    expect(table.rows[0][0]).toBe('Edge Cache Kit');
  });

  it('respects max rows', () => {
    const many = `a,b\n${Array.from({ length: 80 }, (_, i) => `${i},1`).join('\n')}`;
    expect(parseCsv(many, 50).rows).toHaveLength(50);
  });

  it('builds chart aggregates from numeric columns', () => {
    const aggs = numericColumnAggregates(parseCsv(SAMPLE_CSV));
    expect(aggs[0]).toEqual({ label: 'Edge Cache Kit', value: 120 });
    expect(aggs).toHaveLength(5);
  });

  it('handles quoted commas', () => {
    const table = parseCsv('name,note\n"Kit, Pro",ok');
    expect(table.rows[0][0]).toBe('Kit, Pro');
  });
});
