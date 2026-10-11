'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { SAMPLE_URL, type MetaAudit, type MetaSnapshot } from './logic';

type Result = MetaAudit & {
  meta: MetaSnapshot;
  localGaps: string[];
  ogPreview: string;
};

export default function SeoMetaAuditorDemo() {
  const [url, setUrl] = useState(SAMPLE_URL);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
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
        meta: data.meta,
        localGaps: data.localGaps,
        gaps: data.gaps,
        suggestions: data.suggestions,
        ogPreview: data.ogPreview,
      });
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="SEO meta auditor"
      description="Fetch a URL, find meta gaps, rewrite title/description/OG suggestions, and preview an ImageResponse card."
      onReset={() => {
        setUrl(SAMPLE_URL);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="URL" htmlFor="seo-url">
          <Input
            id="seo-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="font-mono text-xs"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Auditing…' : 'Audit meta'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <p className="text-xs text-fd-muted-foreground">
              Current title: {result.meta.title || '(none)'}
            </p>
            <p className="text-xs">
              Gaps:{' '}
              {(result.gaps.length ? result.gaps : result.localGaps).join(', ') || 'none'}
            </p>
            <div className="space-y-1">
              <p>
                <span className="font-medium">Suggested title: </span>
                {result.suggestions.title}
              </p>
              <p>
                <span className="font-medium">Suggested description: </span>
                {result.suggestions.description}
              </p>
            </div>
            {result.ogPreview ? (
              <div className="space-y-2">
                <p className="text-xs text-fd-muted-foreground">
                  OG preview ({result.ogPreview})
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.ogPreview}
                  alt="Open Graph preview"
                  className="w-full max-w-xl rounded-md border border-fd-border"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
