'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_TICKET, type TriageResult } from './logic';

export default function SupportTriageLabDemo() {
  const [ticket, setTicket] = useState(SAMPLE_TICKET);
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ticket }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (res.status === 429) {
        setError(`${data.error}. ${data.setup ?? ''}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Triage failed.');
        return;
      }
      setTriage(data.triage as TriageResult);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Support triage lab"
      description="Paste a ticket - category, priority, and draft reply. Redis rate limit when available."
      onReset={() => {
        setTicket(SAMPLE_TICKET);
        setTriage(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Support ticket" htmlFor="ticket">
          <Textarea
            id="ticket"
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
            className="min-h-32 text-sm"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Triaging…' : 'Triage ticket'}
        </Button>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {triage ? (
          <div className="space-y-2 rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm">
            <p>
              <span className="text-fd-muted-foreground">Category:</span> {triage.category}
            </p>
            <p>
              <span className="text-fd-muted-foreground">Priority:</span> {triage.priority}
            </p>
            <p className="whitespace-pre-wrap">{triage.reply}</p>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
