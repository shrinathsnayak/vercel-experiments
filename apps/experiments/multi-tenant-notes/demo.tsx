'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SAMPLE_NOTE, SAMPLE_TENANT, type Note } from './logic';

export default function MultiTenantNotesDemo() {
  const [tenant, setTenant] = useState(SAMPLE_TENANT);
  const [text, setText] = useState(SAMPLE_NOTE);
  const [notes, setNotes] = useState<Note[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/notes?tenant=${encodeURIComponent(tenant)}`, {
      headers: { 'x-tenant-id': tenant },
    });
    const data = await res.json();
    if (res.ok) { setNotes(data.notes as Note[]); setNote(typeof data.note === 'string' ? data.note : null); }
  }, [tenant]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function add() {
    setError(null);
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-tenant-id': tenant },
      body: JSON.stringify({ text, tenant }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed'); return; }
    setNotes(data.notes as Note[]);
    setNote(typeof data.note === 'string' ? data.note : null);
  }

  return (
    <DemoShell title="Multi-tenant notes" description="Tenant path/header - isolated notes (Neon/memory)."
      onReset={() => { setTenant(SAMPLE_TENANT); setText(SAMPLE_NOTE); setError(null); }}>
      <div className="space-y-4">
        <Field label="Tenant" htmlFor="tenant"><Input id="tenant" value={tenant} onChange={(e) => setTenant(e.target.value)} /></Field>
        <Field label="Note" htmlFor="text"><Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} className="min-h-20 text-sm" /></Field>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={add}>Add note</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Refresh</Button>
        </div>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm">
              <p className="text-xs text-fd-muted-foreground">{n.tenant}</p>
              <p>{n.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}
