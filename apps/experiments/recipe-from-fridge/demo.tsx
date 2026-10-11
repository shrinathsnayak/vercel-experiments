'use client';
import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_INGREDIENTS } from './logic';

export default function Demo() {
  const [input, setInput] = useState(SAMPLE_INGREDIENTS);
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ingredients: input }),
      });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(typeof data.error === 'string' ? data.error : 'Request failed.'); return; }
      setResult(data);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Recipe from Fridge" description="Paste fridge ingredients - structured recipe ideas with steps and missing items via generateObject." onReset={() => { setInput(SAMPLE_INGREDIENTS); setResult(null); setError(null); }}>
      <div className="space-y-4">
        
        <Field label="Ingredients" htmlFor="in"><Textarea id="in" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-28 text-sm" /></Field>
        
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>{loading ? 'Working…' : 'Suggest recipes'}</Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? <pre className="overflow-x-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs" aria-live="polite">{JSON.stringify(result, null, 2)}</pre> : null}
      </div>
    </DemoShell>
  );
}
