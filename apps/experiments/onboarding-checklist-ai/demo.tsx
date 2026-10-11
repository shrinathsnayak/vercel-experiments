'use client';
import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { progressPercent, SAMPLE_ROLE } from './logic';

export default function Demo() {
  const [input, setInput] = useState(SAMPLE_ROLE);
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: input }),
      });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(typeof data.error === 'string' ? data.error : 'Request failed.'); return; }
      setResult(data);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Onboarding Checklist AI" description="Role - AI onboarding checklist with Neon/memory progress tracking." onReset={() => { setInput(SAMPLE_ROLE); setResult(null); setError(null); }}>
      <div className="space-y-4">
        
        <Field label="Role / team" htmlFor="in"><Textarea id="in" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-28 text-sm" /></Field>
        <p className="text-xs text-fd-muted-foreground">Progress helper demo: {progressPercent(1,4)}%</p>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>{loading ? 'Working…' : 'Generate checklist'}</Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? <pre className="overflow-x-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs" aria-live="polite">{JSON.stringify(result, null, 2)}</pre> : null}
      </div>
    </DemoShell>
  );
}
