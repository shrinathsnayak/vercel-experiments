'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import type { BugTicket } from './logic';

export default function ScreenshotToTicketDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [ticket, setTicket] = useState<BugTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!file) { setError('Choose an image first.'); return; }
    setLoading(true); setError(null); setTicket(null);
    try {
      const form = new FormData();
      form.set('file', file);
      const res = await fetch('/api/ticket', { method: 'POST', body: form });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setTicket(data.ticket as BugTicket);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Screenshot to ticket" description="Image vision - structured bug report."
      onReset={() => { setFile(null); setTicket(null); setError(null); }}>
      <div className="space-y-4">
        <Field label="Screenshot" htmlFor="img">
          <Input id="img" type="file" accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Analyzing…' : 'Create bug ticket'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {ticket ? (
          <div className="space-y-2 rounded-md border border-fd-border p-3 text-sm">
            <p className="font-medium">{ticket.title} · {ticket.severity}</p>
            <p className="text-fd-muted-foreground">{ticket.summary}</p>
            <ol className="list-decimal pl-5">{ticket.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            <p><span className="text-xs uppercase text-fd-muted-foreground">Expected</span> {ticket.expected}</p>
            <p><span className="text-xs uppercase text-fd-muted-foreground">Actual</span> {ticket.actual}</p>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
