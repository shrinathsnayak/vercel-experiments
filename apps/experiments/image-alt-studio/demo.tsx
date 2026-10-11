'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import type { AltResult } from './logic';

export default function ImageAltStudioDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<(AltResult & { blobUrl?: string }) | null>(
    null,
  );
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!file) {
      setError('Choose an image first.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setNote(null);
    try {
      const form = new FormData();
      form.set('file', file);
      const res = await fetch('/api/alt', { method: 'POST', body: form });
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
        alt: data.alt,
        seoFilename: data.seoFilename,
        caption: data.caption,
        blobUrl: data.blobUrl,
      });
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Image alt studio"
      description="Upload an image - vision generateObject for alt, SEO filename, and caption. Optional Blob store."
      onReset={() => {
        setFile(null);
        setResult(null);
        setNote(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Image" htmlFor="image">
          <Input
            id="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Analyzing…' : 'Generate alt metadata'}
        </Button>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <dl className="space-y-2 rounded-md border border-fd-border p-3 text-sm">
            <div>
              <dt className="text-xs text-fd-muted-foreground">Alt</dt>
              <dd>{result.alt}</dd>
            </div>
            <div>
              <dt className="text-xs text-fd-muted-foreground">SEO filename</dt>
              <dd className="font-mono text-xs">{result.seoFilename}</dd>
            </div>
            <div>
              <dt className="text-xs text-fd-muted-foreground">Caption</dt>
              <dd>{result.caption}</dd>
            </div>
            {result.blobUrl ? (
              <div>
                <dt className="text-xs text-fd-muted-foreground">Blob URL</dt>
                <dd className="break-all font-mono text-xs">
                  <a href={result.blobUrl} target="_blank" rel="noreferrer">
                    {result.blobUrl}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
    </DemoShell>
  );
}
