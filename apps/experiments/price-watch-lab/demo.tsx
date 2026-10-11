'use client';
import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { parsePrice, SAMPLE_WATCH } from './logic';

export default function Demo() {
  const [input, setInput] = useState(SAMPLE_WATCH);
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/watch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ watch: input }),
      });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(typeof data.error === 'string' ? data.error : 'Request failed.'); return; }
      setResult(data);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Price Watch Lab" description="Track pasted product/price targets with AI notes and Redis/memory watch list." onReset={() => { setInput(SAMPLE_WATCH); setResult(null); setError(null); }}>
      <div className="space-y-4">
        
        <Field label="Product + target price" htmlFor="in"><Textarea id="in" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-28 text-sm" /></Field>
        <p className="text-xs text-fd-muted-foreground">Parsed price: {parsePrice(input) ?? '—'}</p>
        <Button type="button" variant="outline" size="sm" onClick={async () => {
          await fetch('/api/items', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ watch: input, note: result }) });
          setResult(await fetch('/api/items').then(r=>r.json()));
        }}>Save to watch list</Button>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>{loading ? 'Working…' : 'Analyze watch'}</Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? <pre className="overflow-x-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs" aria-live="polite">{JSON.stringify(result, null, 2)}</pre> : null}
      </div>
    </DemoShell>
  );
}
