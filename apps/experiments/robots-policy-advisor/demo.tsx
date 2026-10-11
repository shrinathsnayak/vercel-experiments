'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SAMPLE_ROBOTS, type RobotsAdvice } from './logic';

export default function RobotsPolicyAdvisorDemo() {
  const [robotsText, setRobotsText] = useState(SAMPLE_ROBOTS);
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<RobotsAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/advise', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          robotsText: robotsText.trim() || undefined,
          url: url.trim() || undefined,
        }),
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
        allows: data.allows,
        denies: data.denies,
        suggestions: data.suggestions,
        summary: data.summary,
      });
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Robots policy advisor"
      description="Paste robots.txt or fetch from a URL - allow/deny explanation plus concrete suggestions."
      onReset={() => {
        setRobotsText(SAMPLE_ROBOTS);
        setUrl('');
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="robots.txt (paste)" htmlFor="robots">
          <Textarea
            id="robots"
            value={robotsText}
            onChange={(e) => setRobotsText(e.target.value)}
            className="min-h-36 font-mono text-xs"
          />
        </Field>
        <Field label="Or fetch URL (optional)" htmlFor="robots-url">
          <Input
            id="robots-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/robots.txt"
            className="font-mono text-xs"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Advising…' : 'Advise'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <p>{result.summary}</p>
            {(
              [
                ['Allows', result.allows],
                ['Denies', result.denies],
                ['Suggestions', result.suggestions],
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
