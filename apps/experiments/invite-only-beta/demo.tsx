'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { SAMPLE_CODE, SAMPLE_EMAIL, SEED_CODES } from './logic';

export default function InviteOnlyBetaDemo() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [email, setEmail] = useState(SAMPLE_EMAIL);
  const [allowed, setAllowed] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/invite?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (res.ok) {
      setAllowed(Boolean(data.allowed));
      setMembers((data.members as string[]) ?? []);
      setNote(typeof data.note === 'string' ? data.note : null);
    }
  }, [email]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function redeem() {
    setError(null);
    const res = await fetch('/api/invite', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, email }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Redeem failed'); return; }
    setAllowed(Boolean(data.allowed));
    setMembers((data.members as string[]) ?? []);
    setNote(typeof data.note === 'string' ? data.note : null);
  }

  return (
    <DemoShell title="Invite-only beta" description="Invite codes - allowlist demo (Redis/memory)."
      onReset={() => { setCode(SAMPLE_CODE); setEmail(SAMPLE_EMAIL); setError(null); }}>
      <div className="space-y-4">
        <p className="text-xs text-fd-muted-foreground">Seed codes: {SEED_CODES.join(', ')}</p>
        <Field label="Invite code" htmlFor="code"><Input id="code" value={code} onChange={(e) => setCode(e.target.value)} /></Field>
        <Field label="Email" htmlFor="email"><Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Button type="button" variant="secondary" size="sm" onClick={redeem}>Redeem invite</Button>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <DemoStatus tone={allowed ? 'success' : 'warning'}>
          {allowed ? 'Beta unlocked for this email.' : 'Not on the allowlist yet.'}
        </DemoStatus>
        <ul className="list-disc pl-5 text-sm">{members.map((m) => <li key={m}>{m}</li>)}</ul>
      </div>
    </DemoShell>
  );
}
