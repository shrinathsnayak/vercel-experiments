'use client';

import { useRef, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';

export default function UrlBriefLabDemo() {
  const [url, setUrl] = useState('https://vercel.com/docs/storage/vercel-blob');
  const [summary, setSummary] = useState('');
  const [title, setTitle] = useState('');
  const [ogPreview, setOgPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setSummary('');
    setTitle('');
    setOgPreview('');
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      if (res.status === 503) {
        const data = await res.json();
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }

      const pageTitle = res.headers.get('x-page-title');
      const og = res.headers.get('x-og-preview');
      if (pageTitle) setTitle(decodeURIComponent(pageTitle));
      if (og) setOgPreview(og);

      const reader = res.body?.getReader();
      if (!reader) {
        setError('No response stream.');
        return;
      }
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setSummary((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setSummary((prev) => `${prev}\n\n- Cancelled -`);
      } else {
        setError('Network error.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="URL brief lab"
      description="Fetch a page (size + timeout capped), stream a summary, and preview an ImageResponse OG card."
      onReset={() => {
        setUrl('https://vercel.com/docs/storage/vercel-blob');
        setSummary('');
        setTitle('');
        setOgPreview('');
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="URL" htmlFor="brief-url">
          <Input
            id="brief-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="font-mono text-xs"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
            {loading ? 'Summarizing…' : 'Summarize'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!loading}
            onClick={() => abortRef.current?.abort()}
          >
            Cancel
          </Button>
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {title ? <p className="text-sm font-medium">{title}</p> : null}
        <pre className="min-h-32 overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs leading-relaxed">
          {summary || (loading ? 'Waiting for tokens…' : 'Summary stream will appear here.')}
        </pre>
        {ogPreview ? (
          <div className="space-y-2">
            <p className="text-xs text-fd-muted-foreground">OG preview ({ogPreview})</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ogPreview}
              alt="Open Graph preview"
              className="w-full max-w-xl rounded-md border border-fd-border"
            />
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
