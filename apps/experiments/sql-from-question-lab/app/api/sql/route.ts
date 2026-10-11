import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { getSql, postgresAvailable } from '../../../lib/postgres';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  clampSql,
  DEMO_TABLE_NAMES,
  isSafeSelect,
  MAX_DDL_CHARS,
  MAX_QUESTION_CHARS,
  truncateText,
} from '../../../logic';

export const maxDuration = 60;

const sqlSchema = z.object({
  sql: z.string(),
  explanation: z.string(),
  params: z.array(z.string()).max(20),
  unsafe: z.boolean(),
  unsafeReason: z.string().optional(),
});

async function demoTablesExist(): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  try {
    const rows = (await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('products', 'orders')
    `) as Array<{ table_name: string }>;
    const found = new Set(rows.map((r) => r.table_name));
    return DEMO_TABLE_NAMES.every((name) => found.has(name));
  } catch {
    return false;
  }
}

type QueryFn = {
  (strings: TemplateStringsArray, ...params: unknown[]): Promise<unknown>;
  query?: (text: string, params?: unknown[]) => Promise<unknown>;
};

async function runSelect(sqlText: string): Promise<unknown> {
  const sql = getSql() as QueryFn | null;
  if (!sql) throw new Error('Postgres client unavailable.');
  if (typeof sql.query === 'function') {
    return sql.query(sqlText);
  }
  // Fallback: neon tagged-template only - refuse free-form without .query
  throw new Error('This Neon client build cannot run free-form SQL (explain-only).');
}

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const ddl =
    typeof (json as { ddl?: unknown })?.ddl === 'string'
      ? truncateText((json as { ddl: string }).ddl, MAX_DDL_CHARS)
      : '';
  const question =
    typeof (json as { question?: unknown })?.question === 'string'
      ? truncateText((json as { question: string }).question, MAX_QUESTION_CHARS)
      : '';
  const run =
    typeof (json as { run?: unknown })?.run === 'boolean'
      ? (json as { run: boolean }).run
      : false;

  if (!ddl || !question) {
    return Response.json({ error: 'ddl and question are required.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: sqlSchema,
    prompt: `Write parameterized Postgres SQL for the question against this DDL.
Use $1, $2 placeholders when values are needed; list param descriptions in params.
Prefer SELECT / WITH. Set unsafe=true for writes, DDL, or multi-statements.
explanation: plain English of what the query does.
Do not invent tables/columns outside the DDL.

DDL:
${ddl}

QUESTION:
${question}`,
  });

  const draft = clampSql(result.object);
  let runResult: { attempted: boolean; ok: boolean; detail: string; rows?: unknown } = {
    attempted: false,
    ok: false,
    detail: 'Explain-only (default). Pass run=true with DATABASE_URL and demo tables to execute.',
  };

  if (run) {
    if (!postgresAvailable()) {
      runResult = {
        attempted: true,
        ok: false,
        detail: 'DATABASE_URL not configured - staying explain-only.',
      };
    } else if (!isSafeSelect(draft.sql) || draft.unsafe) {
      runResult = {
        attempted: true,
        ok: false,
        detail: draft.unsafeReason || 'Refusing to run non-SELECT / unsafe SQL.',
      };
    } else {
      const tablesOk = await demoTablesExist();
      if (!tablesOk) {
        runResult = {
          attempted: true,
          ok: false,
          detail: `Demo tables (${DEMO_TABLE_NAMES.join(', ')}) not found - explain-only.`,
        };
      } else {
        try {
          // Parameterized AI SQL cannot be safely bound without a query builder;
          // only run when params is empty and the statement is a pure SELECT.
          if (draft.params.length > 0) {
            runResult = {
              attempted: true,
              ok: false,
              detail:
                'Parameterized queries are explain-only in this lab (no bind API for free-form SQL).',
            };
          } else {
            const rows = await runSelect(draft.sql);
            const list = Array.isArray(rows) ? rows : [];
            runResult = {
              attempted: true,
              ok: true,
              detail: `Returned ${list.length} row(s).`,
              rows: list.slice(0, 20),
            };
          }
        } catch (err) {
          runResult = {
            attempted: true,
            ok: false,
            detail: err instanceof Error ? err.message : 'Query failed.',
          };
        }
      }
    }
  }

  return Response.json({
    ...draft,
    run: runResult,
    provider: providerLabel(),
  });
}
