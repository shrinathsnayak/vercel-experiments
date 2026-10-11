'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import type { ContentView } from './logic';

export default function AuthGatedPreviewDemo() {
  const [password, setPassword] = useState('preview');
  const [content, setContent] = useState<ContentView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/content');
    const data = await res.json();
    if (res.ok) setContent(data.content as ContentView);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function unlock() {
    setError(null);
    const res = await fetch('/api/unlock', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Unlock failed'); return; }
    setContent(data.content as ContentView);
  }

  async function lock() {
    await fetch('/api/lock', { method: 'POST' });
    await refresh();
  }

  return (
    <DemoShell title="Auth-gated preview" description="Password gate + draft/preview content."
      onReset={() => { setPassword('preview'); setError(null); void refresh(); }}>
      <div className="space-y-4">
        <Field label="Password" htmlFor="pw"><Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={unlock}>Unlock preview</Button>
          <Button type="button" variant="outline" size="sm" onClick={lock}>Lock</Button>
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {content ? (
          <div className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm">
            <p className="text-[10px] uppercase tracking-wide text-fd-muted-foreground">{content.mode}</p>
            <p className="mt-1 font-medium">{content.title}</p>
            <p className="mt-1 text-fd-muted-foreground">{content.body}</p>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
