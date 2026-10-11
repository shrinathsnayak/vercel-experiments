'use client';
import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { extractCandidateTerms, SAMPLE_TEXT } from './logic';

export default function Demo() {
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/glossary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(typeof data.error === 'string' ? data.error : 'Request failed.'); return; }
      setResult(data);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Glossary Builder" description="Turn domain text into a structured glossary with local candidate-term helpers." onReset={() => { setInput(SAMPLE_TEXT); setResult(null); setError(null); }}>
      <div className="space-y-4">
        
        <Field label="Domain text" htmlFor="in"><Textarea id="in" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-28 text-sm" /></Field>
        <p className="text-xs text-fd-muted-foreground">Candidates: {extractCandidateTerms(input).join(', ') || '—'}</p>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>{loading ? 'Working…' : 'Build glossary'}</Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? <pre className="overflow-x-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs" aria-live="polite">{JSON.stringify(result, null, 2)}</pre> : null}
      </div>
    </DemoShell>
  );
}
