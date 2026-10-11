'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { HARD_LIMIT, SAMPLE_SESSION, SOFT_LIMIT, type MeterState } from './logic';

export default function UsageMeterLabDemo() {
  const [sessionId, setSessionId] = useState(SAMPLE_SESSION);
  const [state, setState] = useState<MeterState | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ping() {
    setError(null);
    const res = await fetch('/api/meter', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    const data = await res.json();
    if (res.status === 429) {
      setState(data.meter as MeterState);
      setError(data.error || 'Hard limit reached');
      setNote(typeof data.note === 'string' ? data.note : null);
      return;
    }
    if (!res.ok) { setError(data.error || 'Failed'); return; }
    setState(data.meter as MeterState);
    setNote(typeof data.note === 'string' ? data.note : null);
  }

  async function status() {
    const res = await fetch(`/api/meter?sessionId=${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    if (res.ok) { setState(data.meter as MeterState); setNote(typeof data.note === 'string' ? data.note : null); }
  }

  return (
    <DemoShell title="Usage meter lab" description={`Per-session metering · soft ${SOFT_LIMIT} / hard ${HARD_LIMIT}.`}
      onReset={() => { setSessionId(SAMPLE_SESSION); setState(null); setError(null); }}>
      <div className="space-y-4">
        <Field label="Session id" htmlFor="sid"><Input id="sid" value={sessionId} onChange={(e) => setSessionId(e.target.value)} /></Field>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={ping}>Call metered API</Button>
          <Button type="button" variant="outline" size="sm" onClick={status}>Refresh status</Button>
        </div>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {state?.softExceeded && !state.hardExceeded ? (
          <DemoStatus tone="warning">Soft limit reached — still allowed until hard limit.</DemoStatus>
        ) : null}
        {state ? (
          <pre className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">{JSON.stringify(state, null, 2)}</pre>
        ) : null}
      </div>
    </DemoShell>
  );
}
