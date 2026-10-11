export const SEED_CODES = ['BETA-ACME', 'BETA-SHIP', 'BETA-EARLY'] as const;

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '-').slice(0, 32);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 254);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isSeedCode(code: string): boolean {
  return (SEED_CODES as readonly string[]).includes(normalizeCode(code));
}

export const SAMPLE_CODE = 'BETA-ACME';
export const SAMPLE_EMAIL = 'alex@acme.io';
