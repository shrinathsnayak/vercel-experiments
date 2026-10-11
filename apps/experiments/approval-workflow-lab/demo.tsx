'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SAMPLE_BODY, SAMPLE_TITLE, type ApprovalItem } from './logic';

export default function ApprovalWorkflowLabDemo() {
  const [title, setTitle] = useState(SAMPLE_TITLE);
  const [body, setBody] = useState(SAMPLE_BODY);
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/workflow');
    const data = await res.json();
    if (res.ok) {
      setItems(data.items as ApprovalItem[]);
      setNote(typeof data.note === 'string' ? data.note : null);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function create() {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/workflow', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, body, action: 'create' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setItems(data.items as ApprovalItem[]);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  async function submit(id: string) {
    const res = await fetch('/api/workflow', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, action: 'submit' }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Submit failed'); return; }
    setItems(data.items as ApprovalItem[]);
  }

  async function decide(token: string, decision: 'approve' | 'reject') {
    const res = await fetch('/api/decide', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, decision }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Decision failed'); return; }
    setItems(data.items as ApprovalItem[]);
  }

  return (
    <DemoShell title="Approval workflow lab"
      description="Draft - token approve/reject state machine (Neon/memory)."
      onReset={() => { setTitle(SAMPLE_TITLE); setBody(SAMPLE_BODY); setError(null); }}>
      <div className="space-y-4">
        <Field label="Title" htmlFor="title"><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Body" htmlFor="body"><Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-24 text-sm" /></Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={create}>{loading ? 'Saving…' : 'Create draft'}</Button>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm space-y-2">
              <p className="font-medium">{item.title} · <span className="text-xs uppercase">{item.status}</span></p>
              <p className="text-fd-muted-foreground">{item.body}</p>
              {item.status === 'draft' ? (
                <Button type="button" size="sm" variant="outline" onClick={() => submit(item.id)}>Submit for approval</Button>
              ) : null}
              {item.status === 'pending' ? (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={() => decide(item.approveToken, 'approve')}>Approve (token)</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => decide(item.rejectToken, 'reject')}>Reject (token)</Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}
