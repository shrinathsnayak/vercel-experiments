'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import type { DiffResult } from './logic';

export default function BeforeAfterDiffLabDemo() {
  const [before, setBefore] = useState<File | null>(null);
  const [after, setAfter] = useState<File | null>(null);
  const [result, setResult] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!before || !after) { setError('Choose before and after images.'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const form = new FormData();
      form.set('before', before); form.set('after', after);
      const res = await fetch('/api/diff', { method: 'POST', body: form });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setResult(data.result as DiffResult);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Before/after diff lab" description="Two images - change summary via vision."
      onReset={() => { setBefore(null); setAfter(null); setResult(null); setError(null); }}>
      <div className="space-y-4">
        <Field label="Before" htmlFor="before"><Input id="before" type="file" accept="image/*" onChange={(e) => setBefore(e.target.files?.[0] ?? null)} /></Field>
        <Field label="After" htmlFor="after"><Input id="after" type="file" accept="image/*" onChange={(e) => setAfter(e.target.files?.[0] ?? null)} /></Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Diffing…' : 'Summarize changes'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-2 rounded-md border border-fd-border p-3 text-sm">
            <p>{result.summary}</p>
            <p className="text-xs uppercase text-fd-muted-foreground">Changes</p>
            <ul className="list-disc pl-5">{result.changes.map((c, i) => <li key={i}>{c}</li>)}</ul>
            <p className="text-xs uppercase text-fd-muted-foreground">Risks</p>
            <ul className="list-disc pl-5">{result.risks.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
