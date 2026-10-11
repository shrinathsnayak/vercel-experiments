export const MAX_BRIEF_CHARS = 4_000;
export const MAX_EMAIL_CHARS = 8_000;

export type ProposedEmail = {
  to: string;
  subject: string;
  body: string;
};

export function truncateText(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function heuristicEmail(brief: string): ProposedEmail {
  const firstLine = brief.split(/\n/)[0]?.slice(0, 80) || 'Follow-up';
  return {
    to: 'teammate@example.com',
    subject: `Re: ${firstLine}`,
    body: `Hi,\n\nFollowing up on: ${brief.slice(0, 400)}\n\nBest,`,
  };
}

export const SAMPLE_BRIEF =
  'Write a polite follow-up to Alex about the ISR product page demo shipping tomorrow. Mention we need their review before noon.';
