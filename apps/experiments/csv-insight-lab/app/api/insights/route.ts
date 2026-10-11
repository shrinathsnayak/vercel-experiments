import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  MAX_ROWS,
  numericColumnAggregates,
  parseCsv,
  tablePreview,
  truncateText,
} from '../../../logic';

export const maxDuration = 60;

const insightsSchema = z.object({
  insights: z.array(z.string()).max(8),
  caveats: z.array(z.string()).max(4),
});

async function readCsv(request: Request): Promise<
  { ok: true; csv: string } | { ok: false; status: number; error: string }
> {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const pasted = String(form.get('csv') ?? '');
    const file = form.get('file');
    if (file instanceof File && file.size > 0) {
      const text = await file.text();
      return { ok: true, csv: text };
    }
    if (!pasted.trim()) {
      return { ok: false, status: 400, error: 'Provide CSV text or a file.' };
    }
    return { ok: true, csv: pasted };
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON body' };
  }
  const csv =
    typeof (json as { csv?: unknown })?.csv === 'string'
      ? (json as { csv: string }).csv
      : '';
  if (!csv.trim()) {
    return { ok: false, status: 400, error: 'csv is required.' };
  }
  return { ok: true, csv };
}

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  const source = await readCsv(request);
  if (!source.ok) {
    return Response.json({ error: source.error }, { status: source.status });
  }

  const csv = truncateText(source.csv);
  const table = parseCsv(csv, MAX_ROWS);
  if (table.headers.length === 0 || table.rows.length === 0) {
    return Response.json(
      { error: 'CSV must include a header row and at least one data row.' },
      { status: 400 },
    );
  }

  const chartReady = numericColumnAggregates(table);
  const preview = tablePreview(table);

  const result = await generateObject({
    model: resolveModel(),
    schema: insightsSchema,
    prompt: `Analyze ONLY the CSV rows provided below. Never invent rows, columns, or values.
You may summarize trends that are supported by these rows.
Return short insight bullets and optional caveats (e.g. small sample).

PARSED TABLE (${table.rows.length} data rows, max ${MAX_ROWS}):
${preview}`,
  });

  return Response.json({
    insights: result.object.insights.map((s) => s.trim()).filter(Boolean),
    caveats: result.object.caveats.map((s) => s.trim()).filter(Boolean),
    chartReady,
    rowCount: table.rows.length,
    headers: table.headers,
    provider: providerLabel(),
  });
}
