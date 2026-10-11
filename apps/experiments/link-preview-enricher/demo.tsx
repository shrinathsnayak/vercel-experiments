'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_URLS, type EnrichedPreview } from './logic';

export default function LinkPreviewEnricherDemo() {
  const [urlsText, setUrlsText] = useState(SAMPLE_URLS.join('\n'));
  const [previews, setPreviews] = useState<EnrichedPreview[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const urls = urlsText
        .split(/[\n,]+/)
        .map((u) => u.trim())
        .filter(Boolean);
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Preview failed.');
        return;
      }
      setPreviews(data.previews as EnrichedPreview[]);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Link preview enricher"
      description="Fetch URL meta, rewrite titles, render ImageResponse cards; optionally store PNGs in Blob."
      onReset={() => {
        setUrlsText(SAMPLE_URLS.join('\n'));
        setPreviews([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="URLs (one per line)" htmlFor="urls">
          <Textarea
            id="urls"
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            className="min-h-24 text-sm font-mono"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Enriching…' : 'Enrich links'}
        </Button>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <div className="space-y-4">
          {previews.map((p) => (
            <div key={p.url} className="rounded-md border border-fd-border p-3 text-sm">
              <p className="font-medium">{p.rewrittenTitle}</p>
              <p className="mt-1 text-xs text-fd-muted-foreground">{p.url}</p>
              <p className="mt-2 text-fd-muted-foreground">{p.description}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.blobUrl || p.ogPath}
                alt={p.rewrittenTitle}
                className="mt-3 w-full max-w-md rounded border border-fd-border"
              />
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
