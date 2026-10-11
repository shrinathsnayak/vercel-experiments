'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import {
  buildStripeSignatureHeader,
  SAMPLE_EVENT,
  SAMPLE_SECRET,
  signStripePayload,
  type EventLogEntry,
} from './logic';

export default function StripeEventsSandboxDemo() {
  const [rawBody, setRawBody] = useState(JSON.stringify(SAMPLE_EVENT, null, 2));
  const [signature, setSignature] = useState('');
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (res.ok) {
        setEvents(data.events as EventLogEntry[]);
        setNote(typeof data.note === 'string' ? data.note : data.secretHint ?? null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function signLocally() {
    setError(null);
    try {
      const t = Math.floor(Date.now() / 1000);
      const sig = await signStripePayload(SAMPLE_SECRET, rawBody, t);
      setSignature(buildStripeSignatureHeader(t, sig));
    } catch {
      setError('Could not sign payload locally.');
    }
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rawBody, signature }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === 'string'
            ? `${data.error}${data.reason ? ` (${data.reason})` : ''}`
            : 'Request failed.',
        );
        if (data.events) setEvents(data.events as EventLogEntry[]);
        return;
      }
      setEvents(data.events as EventLogEntry[]);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Stripe events sandbox"
      description="Paste Stripe-like JSON, sign with real HMAC (t=.v1=), verify, and log idempotently in Redis/memory."
      onReset={() => {
        setRawBody(JSON.stringify(SAMPLE_EVENT, null, 2));
        setSignature('');
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Event JSON (raw body)" htmlFor="body">
          <Textarea
            id="body"
            value={rawBody}
            onChange={(e) => setRawBody(e.target.value)}
            className="min-h-36 font-mono text-xs"
          />
        </Field>
        <Field label="Stripe-Signature header" htmlFor="sig">
          <Textarea
            id="sig"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="min-h-16 font-mono text-xs"
            placeholder="t=…,v1=…"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={signLocally}>
            Sign with demo secret
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={submit}>
            {loading ? 'Verifying…' : 'Verify + log'}
          </Button>
        </div>
        <p className="text-xs text-fd-muted-foreground">
          Demo secret: <code>{SAMPLE_SECRET}</code> (override with STRIPE_WEBHOOK_SECRET).
        </p>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <ul className="space-y-2">
          {events.map((ev, i) => (
            <li
              key={`${ev.id}-${ev.receivedAt}-${i}`}
              className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm"
            >
              <p className="font-medium">
                {ev.type} · {ev.id}
              </p>
              <p className="mt-1 text-xs text-fd-muted-foreground">
                verified={String(ev.verified)} · duplicate={String(ev.duplicate)}
                {ev.reason ? ` · ${ev.reason}` : ''}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}
