export const MAX_MESSAGES = 40;
export const MAX_BODY_CHARS = 2_000;
export const DIGEST_KEY = 'experiments:inbox-digest:messages';
export const LAST_DIGEST_KEY = 'experiments:inbox-digest:last';

export type InboxMessage = {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
};

export type DigestResult = {
  summary: string;
  messageCount: number;
  mode: 'ai' | 'deterministic';
  generatedAt: string;
};

export function truncateText(text: string, max = MAX_BODY_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampMessages(messages: InboxMessage[]): InboxMessage[] {
  return messages.slice(0, MAX_MESSAGES);
}

export function deterministicDigest(messages: InboxMessage[]): string {
  if (messages.length === 0) return 'Inbox empty - nothing to summarize.';
  const lines = messages.map(
    (m, i) => `${i + 1}. [${m.from}] ${m.subject}: ${truncateText(m.body, 120)}`,
  );
  return `Digest of ${messages.length} message(s):\n${lines.join('\n')}`;
}

export const SEED_MESSAGES: Omit<InboxMessage, 'id' | 'receivedAt'>[] = [
  {
    from: 'sam@partner.co',
    subject: 'Q4 timeline',
    body: 'Can we lock the launch window for Nov 12?',
  },
  {
    from: 'jordan@ops.io',
    subject: 'Redis TTL spike',
    body: 'Cache miss rate climbed overnight - worth a look before standup.',
  },
  {
    from: 'alex@acme.io',
    subject: 'Demo follow-up',
    body: 'Loved the walkthrough. Sending procurement docs tomorrow.',
  },
];
