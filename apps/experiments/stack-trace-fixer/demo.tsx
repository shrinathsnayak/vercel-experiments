'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_ERROR, SAMPLE_STACK, type FixPlan } from './logic';

export default function StackTraceFixerDemo() {
  const [error, setError] = useState(SAMPLE_ERROR);
  const [stack, setStack] = useState(SAMPLE_STACK);
  const [result, setResult] = useState<FixPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const res = await fetch('/api/fix', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error, stack }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setErr(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setErr(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      setResult({
        likelyCause: data.likelyCause,
        nextjsTips: data.nextjsTips,
        reproChecklist: data.reproChecklist,
        docsHints: data.docsHints,
      });
    } catch {
      setErr('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Stack trace fixer"
      description="Paste an error + stack - Next.js tips and a repro checklist grounded in common App Router failure modes."
      onReset={() => {
        setError(SAMPLE_ERROR);
        setStack(SAMPLE_STACK);
        setResult(null);
        setErr(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Error" htmlFor="err">
          <Textarea
            id="err"
            value={error}
            onChange={(e) => setError(e.target.value)}
            className="min-h-24 font-mono text-xs"
          />
        </Field>
        <Field label="Stack" htmlFor="stack">
          <Textarea
            id="stack"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            className="min-h-28 font-mono text-xs"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Diagnosing…' : 'Suggest fixes'}
        </Button>
        {err ? <DemoStatus tone="error">{err}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <p>
              <span className="font-medium">Likely cause: </span>
              {result.likelyCause}
            </p>
            {(
              [
                ['Next.js tips', result.nextjsTips],
                ['Repro checklist', result.reproChecklist],
                ['Docs hints', result.docsHints],
              ] as const
            ).map(([label, items]) => (
              <div key={label}>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
                  {label}
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  {items.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
