const SENSITIVE_HEADER_PATTERN =
  /^(authorization|cookie|set-cookie|x-api-key|x-auth-token|.*secret.*|.*password.*)$/i;

export function redactSensitiveHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADER_PATTERN.test(key)) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function truncateBody(body: string, maxBytes: number): { text: string; truncated: boolean } {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(body);
  if (bytes.length <= maxBytes) {
    return { text: body, truncated: false };
  }
  const slice = bytes.slice(0, maxBytes);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  return { text: `${decoder.decode(slice)}…`, truncated: true };
}

export function buildWebhookEndpoint(origin: string, sessionId: string): string {
  const base = origin.replace(/\/$/, '');
  return `${base}/api/webhooks/${sessionId}`;
}

export function createMockCapture(input: {
  method: string;
  headers?: Record<string, string>;
  body?: string;
}): {
  id: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: string | null;
  bodyTruncated: boolean;
  receivedAt: number;
} {
  const body = input.body ?? null;
  return {
    id: `mock-${Date.now()}`,
    method: input.method.toUpperCase(),
    headers: redactSensitiveHeaders(input.headers ?? { 'content-type': 'application/json' }),
    query: {},
    body,
    bodyTruncated: false,
    receivedAt: Date.now(),
  };
}
