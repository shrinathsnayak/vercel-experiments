export const MAX_BODY_CHARS = 20_000;
export const MAX_EVENTS = 100;
export const DEFAULT_TOLERANCE_SECONDS = 300;

export type EventLogEntry = {
  id: string;
  type: string;
  verified: boolean;
  duplicate: boolean;
  reason?: string;
  receivedAt: string;
};

export function truncateBody(text: string, max = MAX_BODY_CHARS): string {
  return text.length <= max ? text : text.slice(0, max);
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return toHex(sig);
}

/** Stripe-style: signed payload is `${t}.${rawBody}`. */
export async function signStripePayload(
  secret: string,
  body: string,
  timestamp: number,
): Promise<string> {
  return hmacSha256Hex(secret, `${timestamp}.${body}`);
}

export function buildStripeSignatureHeader(timestamp: number, signature: string): string {
  return `t=${timestamp},v1=${signature}`;
}

export function parseStripeSignatureHeader(
  header: string,
): { timestamp: number; signature: string } | null {
  const parts = header.split(',').map((p) => p.trim());
  let timestamp: number | null = null;
  let signature: string | null = null;
  for (const part of parts) {
    if (part.startsWith('t=')) timestamp = Number(part.slice(2));
    if (part.startsWith('v1=')) signature = part.slice(3);
  }
  if (!timestamp || !signature || Number.isNaN(timestamp)) return null;
  return { timestamp, signature };
}

export async function verifyStripeSignature(input: {
  secret: string;
  body: string;
  header: string;
  nowSeconds: number;
  toleranceSeconds?: number;
}): Promise<{ ok: true } | { ok: false; reason: 'malformed' | 'expired' | 'bad-signature' }> {
  const parsed = parseStripeSignatureHeader(input.header);
  if (!parsed) return { ok: false, reason: 'malformed' };
  const tolerance = input.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  if (Math.abs(input.nowSeconds - parsed.timestamp) > tolerance) {
    return { ok: false, reason: 'expired' };
  }
  const expected = await signStripePayload(input.secret, input.body, parsed.timestamp);
  if (!timingSafeEqual(expected, parsed.signature)) {
    return { ok: false, reason: 'bad-signature' };
  }
  return { ok: true };
}

export function eventIdFromBody(body: string): string | null {
  try {
    const json = JSON.parse(body) as { id?: unknown };
    return typeof json.id === 'string' && json.id.trim() ? json.id.trim() : null;
  } catch {
    return null;
  }
}

export function eventTypeFromBody(body: string): string {
  try {
    const json = JSON.parse(body) as { type?: unknown };
    return typeof json.type === 'string' && json.type.trim() ? json.type.trim() : 'unknown';
  } catch {
    return 'unknown';
  }
}

export function clampEvents(events: EventLogEntry[]): EventLogEntry[] {
  return events
    .slice()
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
    .slice(0, MAX_EVENTS);
}

export const SAMPLE_EVENT = {
  id: 'evt_demo_123',
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_abc', amount_total: 4200, currency: 'usd' } },
};

export const SAMPLE_SECRET = 'whsec_demo_secret';
