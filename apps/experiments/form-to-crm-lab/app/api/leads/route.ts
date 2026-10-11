import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable, getServiceStatus } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { getSql, postgresAvailable } from '../../../lib/postgres';
import {
  clampLeads,
  guessCompanyFromEmail,
  heuristicUrgency,
  MAX_LEADS,
  normalizeEmail,
  truncateText,
  type Lead,
  type LeadEnrichment,
} from '../../../logic';

export const maxDuration = 60;

const memory = new Map<string, Lead>();

const enrichSchema = z.object({
  companyGuess: z.string(),
  urgency: z.enum(['low', 'medium', 'high']),
});

async function ensureTable() {
  const sql = getSql();
  if (!sql) return null;
  await sql`
    CREATE TABLE IF NOT EXISTS experiment_leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      message TEXT,
      company_guess TEXT NOT NULL,
      urgency TEXT NOT NULL,
      webhook_status TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return sql;
}

function storageLabel(): 'neon' | 'memory' {
  return postgresAvailable() ? 'neon' : 'memory';
}

async function listLeads(): Promise<Lead[]> {
  const sql = await ensureTable();
  if (sql) {
    const rows = await sql`
      SELECT id, name, email, company, message, company_guess, urgency, webhook_status, created_at
      FROM experiment_leads
      ORDER BY created_at DESC
      LIMIT ${MAX_LEADS}
    `;
    return clampLeads(
      rows.map((row) => ({
        id: String(row.id),
        name: String(row.name),
        email: String(row.email),
        company: row.company ? String(row.company) : undefined,
        message: row.message ? String(row.message) : undefined,
        companyGuess: String(row.company_guess),
        urgency: (row.urgency === 'high' || row.urgency === 'medium' ? row.urgency : 'low') as LeadEnrichment['urgency'],
        webhookStatus: (row.webhook_status as Lead['webhookStatus']) || undefined,
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
    );
  }
  return clampLeads([...memory.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

async function persistLead(lead: Lead) {
  const sql = await ensureTable();
  if (sql) {
    await sql`
      INSERT INTO experiment_leads (id, name, email, company, message, company_guess, urgency, webhook_status)
      VALUES (
        ${lead.id}, ${lead.name}, ${lead.email}, ${lead.company ?? null}, ${lead.message ?? null},
        ${lead.companyGuess}, ${lead.urgency}, ${lead.webhookStatus ?? null}
      )
      ON CONFLICT (id) DO NOTHING
    `;
    return;
  }
  memory.set(lead.id, lead);
}

async function enrichLead(input: {
  name: string;
  email: string;
  company?: string;
  message: string;
}): Promise<LeadEnrichment> {
  if (!aiProviderAvailable()) {
    return {
      companyGuess: input.company?.trim() || guessCompanyFromEmail(input.email),
      urgency: heuristicUrgency(input.message),
    };
  }
  const result = await generateObject({
    model: resolveModel(),
    schema: enrichSchema,
    prompt: `Enrich this CRM lead. Guess company from email/domain if company blank. Urgency from message tone.
name: ${input.name}
email: ${input.email}
company: ${input.company || '(blank)'}
message: ${input.message}`,
  });
  return result.object;
}

async function fireWebhook(url: string, lead: Lead): Promise<'ok' | 'failed'> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'lead.created', lead }),
      signal: AbortSignal.timeout(5_000),
    });
    return res.ok ? 'ok' : 'failed';
  } catch {
    return 'failed';
  }
}

export async function GET() {
  const leads = await listLeads();
  return Response.json({
    leads,
    storage: storageLabel(),
    note:
      storageLabel() === 'memory'
        ? 'DATABASE_URL not set - using in-memory leads (resets on cold start).'
        : undefined,
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const body = json as Record<string, unknown>;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  const company = typeof body.company === 'string' ? body.company.trim() : undefined;
  const message = typeof body.message === 'string' ? truncateText(body.message) : '';
  const webhookUrl =
    typeof body.webhookUrl === 'string' && body.webhookUrl.trim()
      ? body.webhookUrl.trim()
      : undefined;

  if (!name || !email || !email.includes('@')) {
    return Response.json({ error: 'name and valid email are required.' }, { status: 400 });
  }

  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  const enrichment = await enrichLead({ name, email, company, message });
  const provider = providerLabel();

  const lead: Lead = {
    id: `lead-${Date.now()}`,
    name,
    email,
    company: company || undefined,
    message: message || undefined,
    ...enrichment,
    createdAt: new Date().toISOString(),
    webhookStatus: 'skipped',
  };

  if (webhookUrl) {
    try {
      // eslint-disable-next-line no-new
      new URL(webhookUrl);
      lead.webhookStatus = await fireWebhook(webhookUrl, lead);
    } catch {
      lead.webhookStatus = 'failed';
    }
  }

  await persistLead(lead);
  const leads = await listLeads();

  return Response.json({
    lead,
    leads,
    storage: storageLabel(),
    provider,
    postgres: getServiceStatus('postgres').available,
    note:
      storageLabel() === 'memory'
        ? 'DATABASE_URL not set - using in-memory leads (resets on cold start).'
        : undefined,
  });
}
