'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_POLICY, type PolicySummary } from './logic';

export default function PolicySimplifierLabDemo() {
  const [policy, setPolicy] = useState(SAMPLE_POLICY);
  const [result, setResult] = useState<PolicySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ policy }),
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
      const { provider: _p, ...rest } = data as PolicySummary & { provider: string };
      setResult(rest);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Policy simplifier lab"
      description="Paste terms or privacy text. Get a plain-language summary plus key bullets (not legal advice)."
      onReset={() => {
        setPolicy(SAMPLE_POLICY);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Policy / terms" htmlFor="policy">
          <Textarea
            id="policy"
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
            className="min-h-32 text-sm"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Simplifying…' : 'Simplify'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <p>{result.plainSummary}</p>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wide text-fd-muted-foreground">
                Key points
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {result.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
            {result.watchOuts.length > 0 ? (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-wide text-fd-muted-foreground">
                  Watch outs
                </p>
                <ul className="list-disc space-y-1 pl-5 text-fd-muted-foreground">
                  {result.watchOuts.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
