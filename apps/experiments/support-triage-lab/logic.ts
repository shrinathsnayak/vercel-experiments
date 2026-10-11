export const MAX_TICKET_CHARS = 8_000;
export const RATE_LIMIT_KEY_PREFIX = 'experiments:support-triage:rl:';
export const RATE_LIMIT_WINDOW_SECONDS = 60;
export const RATE_LIMIT_MAX = 8;

export type TriageResult = {
  category: 'billing' | 'bug' | 'feature' | 'account' | 'other';
  priority: 'low' | 'medium' | 'high';
  reply: string;
};

export function truncateText(text: string, max = MAX_TICKET_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function heuristicTriage(ticket: string): TriageResult {
  const t = ticket.toLowerCase();
  let category: TriageResult['category'] = 'other';
  if (/\b(bill|invoice|charge|refund|payment)\b/.test(t)) category = 'billing';
  else if (/\b(bug|error|crash|broken|500)\b/.test(t)) category = 'bug';
  else if (/\b(feature|request|would love|wishlist)\b/.test(t)) category = 'feature';
  else if (/\b(login|password|account|sso)\b/.test(t)) category = 'account';

  let priority: TriageResult['priority'] = 'medium';
  if (/\b(urgent|asap|critical|down|outage)\b/.test(t)) priority = 'high';
  else if (/\b(minor|whenever|low)\b/.test(t)) priority = 'low';

  return {
    category,
    priority,
    reply: `Thanks for reaching out. We classified this as ${category} (${priority} priority) and a teammate will follow up shortly.`,
  };
}

export const SAMPLE_TICKET = `Subject: Can't export invoices
Hi - the billing export button returns a 500 since this morning. Urgent for our finance close. Account: acme@example.com`;
