'use client';
import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { computeStreak, SAMPLE_HABIT } from './logic';

export default function Demo() {
  const [input, setInput] = useState(SAMPLE_HABIT);
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ habit: input }),
      });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(typeof data.error === 'string' ? data.error : 'Request failed.'); return; }
      setResult(data);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Habit Tracker Lite" description="Habit plan via AI plus Redis/memory check-ins and streak helpers in logic.ts." onReset={() => { setInput(SAMPLE_HABIT); setResult(null); setError(null); }}>
      <div className="space-y-4">
        
        <Field label="Habit" htmlFor="in"><Textarea id="in" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-28 text-sm" /></Field>
        <p className="text-xs text-fd-muted-foreground">Sample streak helper: {computeStreak(['2026-10-10','2026-10-11','2026-10-12'])} days</p>
        <Button type="button" variant="outline" size="sm" onClick={async () => {
          await fetch('/api/checkin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ habit: input }) });
          const s = await fetch('/api/status').then(r=>r.json());
          setResult(s);
        }}>Check in today</Button>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>{loading ? 'Working…' : 'Plan habit'}</Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? <pre className="overflow-x-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs" aria-live="polite">{JSON.stringify(result, null, 2)}</pre> : null}
      </div>
    </DemoShell>
  );
}
