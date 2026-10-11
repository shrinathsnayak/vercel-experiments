export const MAX_ROWS = 50;
export const MAX_CSV_CHARS = 40_000;

export type CsvTable = {
  headers: string[];
  rows: string[][];
};

export type ChartAggregate = {
  label: string;
  value: number;
};

export function truncateText(text: string, max = MAX_CSV_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

/** Minimal CSV parser: handles quoted fields and commas. Never invents rows. */
export function parseCsv(input: string, maxRows = MAX_ROWS): CsvTable {
  const text = truncateText(input);
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      // Keep quotes in the line so splitLine can honor commas inside fields.
      current += ch;
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
      continue;
    }
    if (ch === '\r') continue;
    current += ch;
  }
  if (current.trim() || lines.length === 0) lines.push(current);

  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const splitLine = (line: string): string[] => {
    const cells: string[] = [];
    let cell = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          q = !q;
        }
        continue;
      }
      if (ch === ',' && !q) {
        cells.push(cell.trim());
        cell = '';
        continue;
      }
      cell += ch;
    }
    cells.push(cell.trim());
    return cells;
  };

  const headers = splitLine(nonEmpty[0]);
  const rows = nonEmpty.slice(1, maxRows + 1).map(splitLine);
  return { headers, rows };
}

export function numericColumnAggregates(table: CsvTable): ChartAggregate[] {
  if (table.headers.length < 2 || table.rows.length === 0) return [];

  // Prefer first column as label, first mostly-numeric column as value.
  let valueIndex = -1;
  for (let c = 1; c < table.headers.length; c++) {
    const numericCount = table.rows.filter((row) => {
      const n = Number(row[c]);
      return row[c] !== undefined && row[c] !== '' && Number.isFinite(n);
    }).length;
    if (numericCount >= Math.ceil(table.rows.length / 2)) {
      valueIndex = c;
      break;
    }
  }
  if (valueIndex < 0) return [];

  return table.rows
    .map((row) => {
      const label = row[0]?.trim() || '(blank)';
      const value = Number(row[valueIndex]);
      if (!Number.isFinite(value)) return null;
      return { label, value };
    })
    .filter((item): item is ChartAggregate => item !== null)
    .slice(0, MAX_ROWS);
}

export function tablePreview(table: CsvTable): string {
  const header = table.headers.join(',');
  const body = table.rows.map((r) => r.join(',')).join('\n');
  return `${header}\n${body}`.trim();
}

export const SAMPLE_CSV = `product,units,revenue
Edge Cache Kit,120,4800
Neon Notes,85,3400
Blob Drop,200,6000
Queue Relay,45,2250
Flags Lab,60,1800`;
