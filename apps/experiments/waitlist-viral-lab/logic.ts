export const MAX_EMAIL_CHARS = 254;
export const MAX_ENTRIES = 200;
export const REFERRAL_CODE_LEN = 8;

export type WaitlistEntry = {
  id: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  position: number;
  createdAt: string;
};

export type DripPreview = {
  day: number;
  subject: string;
  body: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, MAX_EMAIL_CHARS);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function makeReferralCode(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h.toString(36).toUpperCase().padStart(REFERRAL_CODE_LEN, '0').slice(0, REFERRAL_CODE_LEN);
}

export function assignPosition(existingCount: number): number {
  return existingCount + 1;
}

/** Earlier position when referred (demo: skip ahead by min(referrals, 5)). */
export function boostPosition(base: number, referralCount: number): number {
  const boost = Math.min(Math.max(referralCount, 0), 5);
  return Math.max(1, base - boost);
}

export function clampEntries(entries: WaitlistEntry[]): WaitlistEntry[] {
  return entries
    .slice()
    .sort((a, b) => a.position - b.position)
    .slice(0, MAX_ENTRIES);
}

export function buildDripPreview(entry: Pick<WaitlistEntry, 'email' | 'position' | 'referralCode'>): DripPreview[] {
  const shareHint = `Share code ${entry.referralCode} to move up.`;
  return [
    {
      day: 0,
      subject: "You're on the list",
      body: `Hi ${entry.email} - you're #${entry.position}. ${shareHint}`,
    },
    {
      day: 3,
      subject: 'Still cooking',
      body: `Quick ping: your spot is #${entry.position}. ${shareHint}`,
    },
    {
      day: 7,
      subject: 'Almost there',
      body: `One week in. Position #${entry.position}. Invite a friend with ${entry.referralCode}.`,
    },
  ];
}

export const SAMPLE_EMAIL = 'alex@acme-widgets.io';
export const SAMPLE_REFERRAL = 'ACME0001';
