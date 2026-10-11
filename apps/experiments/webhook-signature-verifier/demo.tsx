'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  ReplayNonceStore,
  buildSignatureHeader,
  signPayload,
  verifySignature,
} from './logic';

const DEFAULT_SECRET = 'whsec_demo_only_not_real';
const DEFAULT_BODY = '{"type":"invoice.paid","id":"demo_123"}';

export default function WebhookSignatureVerifierDemo() {
  const [secret, setSecret] = useState(DEFAULT_SECRET);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [tolerance, setTolerance] = useState(300);
  const [clockSkew, setClockSkew] = useState(0);
  const [signature, setSignature] = useState('');
  const [timestamp, setTimestamp] = useState(() => Math.floor(Date.now() / 1000));
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const replayStore = useRef(new ReplayNonceStore());

  const headerValue = useMemo(() => {
    if (!signature) return '';
    return buildSignatureHeader(timestamp, signature);
  }, [signature, timestamp]);

  const generate = useCallback(async () => {
    const ts = Math.floor(Date.now() / 1000);
    const sig = await signPayload(secret, body, ts);
    setTimestamp(ts);
    setSignature(sig);
    setVerifyMessage(null);
  }, [secret, body]);

  async function runVerify(replayCheck: boolean) {
    const nowSeconds = timestamp + clockSkew;
    const result = await verifySignature({
      secret,
      body,
      timestamp,
      signature,
      toleranceSeconds: tolerance,
      nowSeconds,
      replayStore: replayCheck ? replayStore.current : undefined,
    });
    if (result.ok) {
      setVerifyMessage('Signature valid (simulated verifier).');
    } else {
      setVerifyMessage(`Verification failed: ${result.reason}`);
    }
  }

  return (
    <DemoShell
      title="Webhook signature verifier"
      description="Generate HMAC-SHA256 webhook signatures and verify them with tolerance and optional replay protection."
      example={`const sig = await signPayload(secret, rawBody, timestamp);
// Compare timing-safe; reject if |now - timestamp| > tolerance`}
      onReset={() => {
        setSecret(DEFAULT_SECRET);
        setBody(DEFAULT_BODY);
        setTolerance(300);
        setClockSkew(0);
        setSignature('');
        setTimestamp(Math.floor(Date.now() / 1000));
        setVerifyMessage(null);
        replayStore.current = new ReplayNonceStore();
      }}
    >
      <DemoStatus tone="neutral">
        Uses Web Crypto in the browser with dummy secrets - not connected to a live webhook provider.
      </DemoStatus>
      <div className="mt-4 space-y-3">
        <Field label="Signing secret (dummy)">
          <Input
            className="font-mono text-xs"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </Field>
        <Field label="Raw body">
          <Textarea
            className="min-h-24 font-mono text-xs"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tolerance (seconds)">
            <Input
              type="number"
              min={0}
              max={3600}
              className="text-xs"
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
            />
          </Field>
          <Field label="Verifier clock skew (seconds)">
            <Input
              type="number"
              min={-7200}
              max={7200}
              className="text-xs"
              value={clockSkew}
              onChange={(e) => setClockSkew(Number(e.target.value))}
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={generate}>
            Generate signature
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!signature}
            onClick={() => runVerify(false)}
          >
            Verify
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!signature}
            onClick={() => runVerify(true)}
          >
            Verify with replay store
          </Button>
        </div>
        {headerValue ? (
          <pre className="overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
            {headerValue}
          </pre>
        ) : null}
        {verifyMessage ? (
          <DemoStatus tone={verifyMessage.includes('valid') ? 'success' : 'error'}>
            {verifyMessage}
          </DemoStatus>
        ) : null}
      </div>
    </DemoShell>
  );
}
