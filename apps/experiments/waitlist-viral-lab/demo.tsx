'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { SAMPLE_EMAIL, type DripPreview, type WaitlistEntry } from './logic';

export default function WaitlistViralLabDemo() {
  const [email, setEmail] = useState(SAMPLE_EMAIL);
  const [referredBy, setReferredBy] = useState('');
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [drips, setDrips] = useState<DripPreview[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/waitlist');
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries as WaitlistEntry[]);
        setNote(typeof data.note === 'string' ? data.note : null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function join() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, referredBy: referredBy || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      setEntries(data.entries as WaitlistEntry[]);
      setNote(typeof data.note === 'string' ? data.note : null);
      if (data.entry?.referralCode) {
        setReferredBy('');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  async function previewDrip() {
    setError(null);
    const top = entries[0];
    const params = new URLSearchParams({ run: '1' });
    if (top) {
      params.set('email', top.email);
      params.set('position', String(top.position));
      params.set('code', top.referralCode);
    }
    try {
      const res = await fetch(`/api/drip?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Drip preview failed.');
        return;
      }
      setDrips(data.drips as DripPreview[]);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    }
  }

  return (
    <DemoShell
      title="Waitlist viral lab"
      description="Email waitlist with Neon/memory, referral codes, position boosts, and Cron drip preview (no real email)."
      onReset={() => {
        setEmail(SAMPLE_EMAIL);
        setReferredBy('');
        setDrips([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Referral code (optional)" htmlFor="ref">
          <Input
            id="ref"
            placeholder="Paste a friend's code"
            value={referredBy}
            onChange={(e) => setReferredBy(e.target.value)}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={join}>
            {loading ? 'Joining…' : 'Join waitlist'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={previewDrip}>
            Cron drip preview
          </Button>
        </div>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm"
            >
              <p className="font-medium">
                #{entry.position} · {entry.email}
              </p>
              <p className="mt-1 text-xs text-fd-muted-foreground">
                Code: {entry.referralCode}
                {entry.referredBy ? ` · via ${entry.referredBy}` : ''}
              </p>
            </li>
          ))}
        </ul>
        {drips.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
              Drip preview
            </p>
            {drips.map((d) => (
              <div
                key={d.day}
                className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm"
              >
                <p className="font-medium">
                  Day {d.day}: {d.subject}
                </p>
                <p className="mt-1 text-fd-muted-foreground">{d.body}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
