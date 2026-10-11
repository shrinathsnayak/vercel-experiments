'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import type { DigestResult, InboxMessage } from './logic';

export default function InboxDigestCronDemo() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [digest, setDigest] = useState<DigestResult | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function seed() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Seed failed.');
        return;
      }
      setMessages(data.messages as InboxMessage[]);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  async function runDigest() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/digest?run=1');
      const data = await res.json();
      if (res.status === 401) {
        setError('Unauthorized - set CRON_SECRET or run locally.');
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Digest failed.');
        return;
      }
      setDigest(data.digest as DigestResult);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Inbox digest cron"
      description="Seed inbox messages in Redis/memory, then run a Cron-style digest (AI or deterministic)."
      onReset={() => {
        setMessages([]);
        setDigest(null);
        setError(null);
        setNote(null);
      }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={seed}>
            Seed inbox
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={loading} onClick={runDigest}>
            Run digest
          </Button>
        </div>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {messages.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {messages.map((m) => (
              <li key={m.id} className="rounded-md border border-fd-border p-3">
                <p className="font-medium">{m.subject}</p>
                <p className="text-xs text-fd-muted-foreground">
                  {m.from} · {m.body}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        {digest ? (
          <div className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm whitespace-pre-wrap">
            <p className="mb-2 text-xs uppercase tracking-wide text-fd-muted-foreground">
              {digest.mode} · {digest.messageCount} msgs · {digest.generatedAt}
            </p>
            {digest.summary}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
