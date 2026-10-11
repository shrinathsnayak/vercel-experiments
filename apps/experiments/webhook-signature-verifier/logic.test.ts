import { describe, expect, it } from 'vitest';
import {
  ReplayNonceStore,
  signPayload,
  verifySignature,
} from './logic';

const secret = 'whsec_demo_secret';
const body = '{"event":"ping"}';

describe('signPayload', () => {
  it('is deterministic for same inputs', async () => {
    const a = await signPayload(secret, body, 1_700_000_000);
    const b = await signPayload(secret, body, 1_700_000_000);
    expect(a).toBe(b);
  });
});

describe('verifySignature', () => {
  it('accepts valid signatures', async () => {
    const ts = 1_700_000_000;
    const sig = await signPayload(secret, body, ts);
    const result = await verifySignature({
      secret,
      body,
      timestamp: ts,
      signature: sig,
      toleranceSeconds: 300,
      nowSeconds: ts + 10,
    });
    expect(result).toEqual({ ok: true });
  });

  it('rejects expired timestamps', async () => {
    const ts = 1_700_000_000;
    const sig = await signPayload(secret, body, ts);
    const result = await verifySignature({
      secret,
      body,
      timestamp: ts,
      signature: sig,
      toleranceSeconds: 60,
      nowSeconds: ts + 120,
    });
    expect(result).toEqual({ ok: false, reason: 'expired' });
  });

  it('rejects wrong secret', async () => {
    const ts = 1_700_000_000;
    const sig = await signPayload(secret, body, ts);
    const result = await verifySignature({
      secret: 'other',
      body,
      timestamp: ts,
      signature: sig,
      toleranceSeconds: 300,
      nowSeconds: ts,
    });
    expect(result).toEqual({ ok: false, reason: 'bad-signature' });
  });

  it('rejects replayed nonces', async () => {
    const ts = 1_700_000_000;
    const sig = await signPayload(secret, body, ts);
    const store = new ReplayNonceStore();
    const first = await verifySignature({
      secret,
      body,
      timestamp: ts,
      signature: sig,
      toleranceSeconds: 300,
      nowSeconds: ts,
      replayStore: store,
    });
    const second = await verifySignature({
      secret,
      body,
      timestamp: ts,
      signature: sig,
      toleranceSeconds: 300,
      nowSeconds: ts,
      replayStore: store,
    });
    expect(first.ok).toBe(true);
    expect(second).toEqual({ ok: false, reason: 'replay' });
  });
});
