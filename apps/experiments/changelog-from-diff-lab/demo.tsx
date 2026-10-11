'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_DIFF, type ChangelogResult } from './logic';

export default function ChangelogFromDiffLabDemo() {
  const [diff, setDiff] = useState(SAMPLE_DIFF);
  const [result, setResult] = useState<ChangelogResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/changelog', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ diff }),
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
      setResult({
        customerFacing: data.customerFacing as string[],
        internalNotes: data.internalNotes as string[],
      });
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Changelog from diff lab"
      description="Paste a PR diff or commits - generateObject customer-facing bullets and internal notes."
      onReset={() => {
        setDiff(SAMPLE_DIFF);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Diff / commits" htmlFor="diff">
          <Textarea
            id="diff"
            value={diff}
            onChange={(e) => setDiff(e.target.value)}
            className="min-h-36 font-mono text-xs"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Drafting…' : 'Draft changelog'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
                Customer-facing
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {result.customerFacing.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
                Internal notes
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {result.internalNotes.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
