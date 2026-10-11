'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_LIGHTHOUSE, type ActionPlan } from './logic';

export default function LighthouseActionPlanDemo() {
  const [lighthouseJson, setLighthouseJson] = useState(SAMPLE_LIGHTHOUSE);
  const [result, setResult] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lighthouseJson }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      setResult({ scoreSummary: data.scoreSummary, fixes: data.fixes });
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Lighthouse action plan"
      description="Paste Lighthouse JSON - prioritized Next.js fixes (P0/P1/P2) grounded in weak audits."
      onReset={() => {
        setLighthouseJson(SAMPLE_LIGHTHOUSE);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Lighthouse JSON" htmlFor="lh">
          <Textarea
            id="lh"
            value={lighthouseJson}
            onChange={(e) => setLighthouseJson(e.target.value)}
            className="min-h-40 font-mono text-xs"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Planning…' : 'Build action plan'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <p>{result.scoreSummary}</p>
            <ul className="space-y-2">
              {result.fixes.map((fix, i) => (
                <li key={i} className="rounded-md border border-fd-border p-3">
                  <p className="font-medium">
                    {fix.priority} · {fix.category}
                  </p>
                  <p className="mt-1">{fix.issue}</p>
                  <p className="mt-1 text-fd-muted-foreground">{fix.nextjsFix}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
