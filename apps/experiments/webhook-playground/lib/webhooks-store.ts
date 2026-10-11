import { redactSensitiveHeaders, truncateBody } from '../logic';
import { getRedis } from '@/lib/redis';

export const WEBHOOK_MAX_BODY_BYTES = 64 * 1024;
export const WEBHOOK_MAX_REQUESTS_PER_SESSION = 100;
export const WEBHOOK_SESSION_TTL_MS = 30 * 60 * 1000;
export const WEBHOOK_RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const WEBHOOK_RATE_LIMIT_MAX = 120;

const REDIS_PREFIX = 'webhook:session:';
const REDIS_TTL_SECONDS = Math.ceil(WEBHOOK_SESSION_TTL_MS / 1000);

export type CapturedRequest = {
  id: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: string | null;
  bodyTruncated: boolean;
  receivedAt: number;
};

export type WebhookSession = {
  id: string;
  createdAt: number;
  expiresAt: number;
  requests: CapturedRequest[];
  rateLimit: { windowStart: number; count: number };
};

const sessions = new Map<string, WebhookSession>();

function purgeExpired() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(id);
    }
  }
}

function memoryCreateSession(): WebhookSession {
  purgeExpired();
  const now = Date.now();
  const id = crypto.randomUUID();
  const session: WebhookSession = {
    id,
    createdAt: now,
    expiresAt: now + WEBHOOK_SESSION_TTL_MS,
    requests: [],
    rateLimit: { windowStart: now, count: 0 },
  };
  sessions.set(id, session);
  return session;
}

function memoryGetSession(sessionId: string): WebhookSession | null {
  purgeExpired();
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

async function redisGetSession(sessionId: string): Promise<WebhookSession | null> {
  const redis = getRedis();
  if (!redis) return null;
  const session = await redis.get<WebhookSession>(`${REDIS_PREFIX}${sessionId}`);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    await redis.del(`${REDIS_PREFIX}${sessionId}`);
    return null;
  }
  return session;
}

async function redisSaveSession(session: WebhookSession): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  session.expiresAt = Date.now() + WEBHOOK_SESSION_TTL_MS;
  await redis.set(`${REDIS_PREFIX}${session.id}`, session, { ex: REDIS_TTL_SECONDS });
}

export function webhookStoreBackend(): 'redis' | 'memory' {
  return getRedis() ? 'redis' : 'memory';
}

export async function createSession(): Promise<WebhookSession> {
  const redis = getRedis();
  if (!redis) return memoryCreateSession();

  const now = Date.now();
  const session: WebhookSession = {
    id: crypto.randomUUID(),
    createdAt: now,
    expiresAt: now + WEBHOOK_SESSION_TTL_MS,
    requests: [],
    rateLimit: { windowStart: now, count: 0 },
  };
  await redisSaveSession(session);
  return session;
}

export async function getSession(sessionId: string): Promise<WebhookSession | null> {
  if (getRedis()) return redisGetSession(sessionId);
  return memoryGetSession(sessionId);
}

function checkRateLimit(session: WebhookSession): boolean {
  const now = Date.now();
  if (now - session.rateLimit.windowStart >= WEBHOOK_RATE_LIMIT_WINDOW_MS) {
    session.rateLimit = { windowStart: now, count: 0 };
  }
  if (session.rateLimit.count >= WEBHOOK_RATE_LIMIT_MAX) {
    return false;
  }
  session.rateLimit.count += 1;
  return true;
}

export type CaptureResult =
  | { ok: true; request: CapturedRequest }
  | { ok: false; code: 'not_found' | 'rate_limited' | 'max_requests' | 'body_too_large' };

export async function captureRequest(
  sessionId: string,
  input: {
    method: string;
    headers: Headers;
    searchParams: URLSearchParams;
    bodyText: string | null;
  },
): Promise<CaptureResult> {
  const session = await getSession(sessionId);
  if (!session) {
    return { ok: false, code: 'not_found' };
  }
  if (!checkRateLimit(session)) {
    return { ok: false, code: 'rate_limited' };
  }
  if (session.requests.length >= WEBHOOK_MAX_REQUESTS_PER_SESSION) {
    return { ok: false, code: 'max_requests' };
  }
  if (input.bodyText && new TextEncoder().encode(input.bodyText).length > WEBHOOK_MAX_BODY_BYTES) {
    return { ok: false, code: 'body_too_large' };
  }

  const headerRecord: Record<string, string> = {};
  input.headers.forEach((value, key) => {
    headerRecord[key] = value;
  });

  const query: Record<string, string> = {};
  input.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  let body: string | null = input.bodyText;
  let bodyTruncated = false;
  if (body) {
    const truncated = truncateBody(body, WEBHOOK_MAX_BODY_BYTES);
    body = truncated.text;
    bodyTruncated = truncated.truncated;
  }

  const request: CapturedRequest = {
    id: crypto.randomUUID(),
    method: input.method.toUpperCase(),
    headers: redactSensitiveHeaders(headerRecord),
    query,
    body,
    bodyTruncated,
    receivedAt: Date.now(),
  };

  session.requests.unshift(request);
  session.expiresAt = Date.now() + WEBHOOK_SESSION_TTL_MS;

  if (getRedis()) {
    await redisSaveSession(session);
  }

  return { ok: true, request };
}

export async function getCapturedRequest(
  sessionId: string,
  requestId: string,
): Promise<CapturedRequest | null> {
  const session = await getSession(sessionId);
  if (!session) return null;
  return session.requests.find((r) => r.id === requestId) ?? null;
}
