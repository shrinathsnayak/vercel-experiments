'use client';
import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { parseAmounts, parsePeople, splitEvenly, SAMPLE_EXPENSES } from './logic';

export default function Demo() {
  const [input, setInput] = useState(SAMPLE_EXPENSES);
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/split', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ expenses: input }),
      });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(typeof data.error === 'string' ? data.error : 'Request failed.'); return; }
      setResult(data);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Budget Split Lab" description="Expenses and people - local fair-share math plus AI rationale for category splits." onReset={() => { setInput(SAMPLE_EXPENSES); setResult(null); setError(null); }}>
      <div className="space-y-4">
        
        <Field label="Expenses (amount name)" htmlFor="in"><Textarea id="in" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-28 text-sm" /></Field>
        {(() => { const amounts = parseAmounts(input); const people = parsePeople(input); const total = amounts.reduce((a,b)=>a+b,0); return <p className="text-xs text-fd-muted-foreground">Local split: {people.length} people · total {total} · ~{splitEvenly(total, people.length)} each</p>; })()}
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>{loading ? 'Working…' : 'Split budget'}</Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? <pre className="overflow-x-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs" aria-live="polite">{JSON.stringify(result, null, 2)}</pre> : null}
      </div>
    </DemoShell>
  );
}
