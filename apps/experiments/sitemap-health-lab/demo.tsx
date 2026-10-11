'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { DEFAULT_SAMPLE, SAMPLE_SITEMAP, type LinkCheck } from './logic';

type Result = {
  sampled: number;
  delayMs: number;
  summary: { ok: number; failed: number; avgMs: number };
  checks: LinkCheck[];
};

export default function SitemapHealthLabDemo() {
  const [sitemapUrl, setSitemapUrl] = useState(SAMPLE_SITEMAP);
  const [sample, setSample] = useState(String(DEFAULT_SAMPLE));
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sitemapUrl,
          sample: Number(sample) || DEFAULT_SAMPLE,
        }),
      });
      const data = await res.json();
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
      title="Sitemap health lab"
      description="Fetch a sitemap, sample <loc> URLs, and check status codes with a rate-limited delay between requests."
      onReset={() => {
        setSitemapUrl(SAMPLE_SITEMAP);
        setSample(String(DEFAULT_SAMPLE));
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Sitemap URL" htmlFor="sitemap-url">
          <Input
            id="sitemap-url"
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            className="font-mono text-xs"
          />
        </Field>
        <Field label="Sample size" htmlFor="sample">
          <Input
            id="sample"
            type="number"
            min={1}
            max={15}
            value={sample}
            onChange={(e) => setSample(e.target.value)}
            className="w-24"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Checking…' : 'Check sample'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <DemoStatus tone={result.summary.failed ? 'warning' : 'success'}>
              {result.summary.ok} ok / {result.summary.failed} failed · avg{' '}
              {result.summary.avgMs}ms · delay {result.delayMs}ms
            </DemoStatus>
            <ul className="space-y-1 font-mono text-xs">
              {result.checks.map((c) => (
                <li key={c.url}>
                  {c.ok ? '✓' : '✗'} {c.status ?? c.error} · {c.ms}ms · {c.url}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
