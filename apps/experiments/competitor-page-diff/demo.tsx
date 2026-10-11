'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { SAMPLE_A, SAMPLE_B, type MessagingDiff } from './logic';

type Result = MessagingDiff & {
  pages: {
    a: { url: string; title: string; description: string };
    b: { url: string; title: string; description: string };
  };
};

export default function CompetitorPageDiffDemo() {
  const [urlA, setUrlA] = useState(SAMPLE_A);
  const [urlB, setUrlB] = useState(SAMPLE_B);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/diff', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ urlA, urlB }),
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
      setResult(data as Result);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Competitor page diff"
      description="Fetch two public URLs (size + timeout capped), then generateObject a structured messaging diff."
      onReset={() => {
        setUrlA(SAMPLE_A);
        setUrlB(SAMPLE_B);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="URL A" htmlFor="url-a">
          <Input
            id="url-a"
            value={urlA}
            onChange={(e) => setUrlA(e.target.value)}
            className="font-mono text-xs"
          />
        </Field>
        <Field label="URL B" htmlFor="url-b">
          <Input
            id="url-b"
            value={urlB}
            onChange={(e) => setUrlB(e.target.value)}
            className="font-mono text-xs"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Comparing…' : 'Compare pages'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <p className="text-xs text-fd-muted-foreground">
              {result.pages.a.title} vs {result.pages.b.title}
            </p>
            {(
              [
                ['Shared themes', result.sharedThemes],
                ['A only', result.aOnly],
                ['B only', result.bOnly],
                ['Positioning notes', result.positioningNotes],
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
