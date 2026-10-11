import { describe, expect, it } from 'vitest';
import {
  buildStripeSignatureHeader,
  eventIdFromBody,
  eventTypeFromBody,
  signStripePayload,
  verifyStripeSignature,
} from './logic';

describe('stripe-events-sandbox logic', () => {
  it('parses event id/type from JSON', () => {
    const body = JSON.stringify({ id: 'evt_1', type: 'invoice.paid' });
    expect(eventIdFromBody(body)).toBe('evt_1');
    expect(eventTypeFromBody(body)).toBe('invoice.paid');
    expect(eventIdFromBody('not-json')).toBeNull();
  });

  it('verifies real HMAC signatures', async () => {
    const secret = 'whsec_test';
    const body = '{"id":"evt_1","type":"ping"}';
    const t = 1_700_000_000;
    const sig = await signStripePayload(secret, body, t);
    const header = buildStripeSignatureHeader(t, sig);
    const ok = await verifyStripeSignature({
      secret,
      body,
      header,
      nowSeconds: t + 10,
    });
    expect(ok).toEqual({ ok: true });

    const bad = await verifyStripeSignature({
      secret,
      body,
      header: buildStripeSignatureHeader(t, 'deadbeef'),
      nowSeconds: t + 10,
    });
    expect(bad).toEqual({ ok: false, reason: 'bad-signature' });
  });

  it('rejects expired timestamps', async () => {
    const secret = 'whsec_test';
    const body = '{}';
    const t = 1_700_000_000;
    const sig = await signStripePayload(secret, body, t);
    const result = await verifyStripeSignature({
      secret,
      body,
      header: buildStripeSignatureHeader(t, sig),
      nowSeconds: t + 10_000,
      toleranceSeconds: 300,
    });
    expect(result).toEqual({ ok: false, reason: 'expired' });
  });
});
