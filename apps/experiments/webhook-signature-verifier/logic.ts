export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'expired' | 'bad-signature' | 'replay' | 'malformed' };

export class ReplayNonceStore {
  private readonly seen = new Set<string>();
  constructor(private readonly maxEntries = 500) {}

  has(nonce: string): boolean {
    return this.seen.has(nonce);
  }

  remember(nonce: string): void {
    this.seen.add(nonce);
    if (this.seen.size > this.maxEntries) {
      const first = this.seen.values().next().value;
      if (first) this.seen.delete(first);
    }
  }
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

export async function signPayload(
  secret: string,
  body: string,
  timestamp: number,
): Promise<string> {
  const payload = `${timestamp}.${body}`;
  return hmacSha256Hex(secret, payload);
}

export function buildSignatureHeader(timestamp: number, signature: string): string {
  return `t=${timestamp},v1=${signature}`;
}

export function parseSignatureHeader(header: string): { timestamp: number; signature: string } | null {
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

export async function verifySignature(input: {
  secret: string;
  body: string;
  timestamp: number;
  signature: string;
  toleranceSeconds: number;
  nowSeconds: number;
  replayStore?: ReplayNonceStore;
}): Promise<VerifyResult> {
  const { secret, body, timestamp, signature, toleranceSeconds, nowSeconds, replayStore } = input;
  const skew = Math.abs(nowSeconds - timestamp);
  if (skew > toleranceSeconds) {
    return { ok: false, reason: 'expired' };
  }

  const expected = await signPayload(secret, body, timestamp);
  if (!timingSafeEqual(expected, signature)) {
    return { ok: false, reason: 'bad-signature' };
  }

  const nonce = `${timestamp}:${signature}`;
  if (replayStore?.has(nonce)) {
    return { ok: false, reason: 'replay' };
  }
  replayStore?.remember(nonce);

  return { ok: true };
}
