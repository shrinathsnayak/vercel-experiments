import { describe, expect, it } from 'vitest';
import { buildWebhookEndpoint, redactSensitiveHeaders, truncateBody } from './logic';

describe('redactSensitiveHeaders', () => {
  it('redacts authorization and cookie headers', () => {
    const result = redactSensitiveHeaders({
      authorization: 'Bearer x',
      cookie: 'a=b',
      'x-api-key': 'k',
      accept: 'application/json',
    });
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.cookie).toBe('[REDACTED]');
    expect(result['x-api-key']).toBe('[REDACTED]');
    expect(result.accept).toBe('application/json');
  });
});

describe('truncateBody', () => {
  it('truncates when over max bytes', () => {
    const body = 'a'.repeat(100);
    const { text, truncated } = truncateBody(body, 50);
    expect(truncated).toBe(true);
    expect(text.endsWith('…')).toBe(true);
  });
});

describe('buildWebhookEndpoint', () => {
  it('builds stable endpoint path', () => {
    expect(buildWebhookEndpoint('https://example.com', 'abc')).toBe(
      'https://example.com/api/webhooks/abc',
    );
  });
});
