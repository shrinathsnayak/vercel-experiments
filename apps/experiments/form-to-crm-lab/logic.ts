export const MAX_MESSAGE_CHARS = 4_000;
export const MAX_LEADS = 50;

export type LeadInput = {
  name: string;
  email: string;
  company?: string;
  message?: string;
  webhookUrl?: string;
};

export type LeadEnrichment = {
  companyGuess: string;
  urgency: 'low' | 'medium' | 'high';
};

export type Lead = LeadInput &
  LeadEnrichment & {
    id: string;
    createdAt: string;
    webhookStatus?: 'skipped' | 'ok' | 'failed';
  };

export function truncateText(text: string, max = MAX_MESSAGE_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function guessCompanyFromEmail(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  if (!domain || ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'].includes(domain)) {
    return 'Unknown / personal email';
  }
  const root = domain.split('.')[0] ?? domain;
  return root.charAt(0).toUpperCase() + root.slice(1);
}

export function heuristicUrgency(message: string): LeadEnrichment['urgency'] {
  const m = message.toLowerCase();
  if (/\b(asap|urgent|immediately|today|critical)\b/.test(m)) return 'high';
  if (/\b(soon|this week|priority|important)\b/.test(m)) return 'medium';
  return 'low';
}

export function clampLeads(leads: Lead[]): Lead[] {
  return leads.slice(0, MAX_LEADS);
}

export const SAMPLE_LEAD: LeadInput = {
  name: 'Alex Rivera',
  email: 'alex@acme-widgets.io',
  company: '',
  message: 'Interested in enterprise pricing ASAP - need a demo this week for our ops team.',
};
