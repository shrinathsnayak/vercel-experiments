import { describe, expect, it } from 'vitest';
import { jsonError, methodNotAllowed } from './errors';

describe('jsonError', () => {
  it('returns structured JSON with code, message, and hint', async () => {
    const response = jsonError(
      404,
      'not_found',
      'Missing resource',
      'Try listing experiments first.',
    );
    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'not_found',
        message: 'Missing resource',
        hint: 'Try listing experiments first.',
      },
    });
  });
});

describe('methodNotAllowed', () => {
  it('returns 405 with allowed methods', async () => {
    const response = methodNotAllowed(['GET']);
    expect(response.status).toBe(405);
    const body = await response.json();
    expect(body.error.code).toBe('method_not_allowed');
    expect(body.error.message).toContain('GET');
  });
});
