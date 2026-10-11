'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { blobSetupSnippet, formatBytes, MAX_UPLOAD_BYTES } from './logic';

type BlobItem = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt?: string;
};

export default function BlobStorageLabDemo() {
  const [text, setText] = useState('Hello from Vercel Blob');
  const [filename, setFilename] = useState('hello.txt');
  const [blobs, setBlobs] = useState<BlobItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/blob/upload');
    if (res.status === 503) {
      setConfigured(false);
      const data = (await res.json()) as { setup?: string };
      setError(data.setup ?? 'Blob not configured');
      setBlobs([]);
      return;
    }
    setConfigured(true);
    setError(null);
    const data = (await res.json()) as { blobs: BlobItem[] };
    setBlobs(data.blobs);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function upload() {
    setLoading(true);
    setError(null);
    try {
      const file = new File([text], filename, { type: 'text/plain' });
      if (file.size > MAX_UPLOAD_BYTES) {
        setError(`Max size is ${formatBytes(MAX_UPLOAD_BYTES)}`);
        return;
      }
      const form = new FormData();
      form.set('file', file);
      form.set('filename', filename);
      const res = await fetch('/api/blob/upload', { method: 'POST', body: form });
      const data = (await res.json()) as { error?: string; setup?: string };
      if (!res.ok) {
        setError(data.setup ?? data.error ?? 'Upload failed');
        setConfigured(res.status !== 503);
        return;
      }
      setConfigured(true);
      await refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function remove(url: string) {
    await fetch('/api/blob/upload', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    await refresh();
  }

  return (
    <DemoShell
      title="Blob storage lab"
      description="Upload and list objects with Vercel Blob - provisioned via one-click Deploy stores."
      example={blobSetupSnippet()}
      onReset={() => {
        setText('Hello from Vercel Blob');
        setFilename('hello.txt');
        setError(null);
      }}
    >
      {configured === false ? (
        <DemoStatus tone="warning">
          Blob token missing. Use the Deploy button (includes a Blob store) or set
          BLOB_READ_WRITE_TOKEN.
        </DemoStatus>
      ) : (
        <DemoStatus tone="success">Live Vercel Blob - uploads go to experiments/blob-lab/.</DemoStatus>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Filename">
            <Input
              className="font-mono text-xs"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
          </Field>
          <Field label="Text content">
            <Textarea
              className="min-h-28 font-mono text-xs"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </Field>
          <Button type="button" onClick={upload} disabled={loading}>
            {loading ? 'Uploading…' : 'Upload to Blob'}
          </Button>
          {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium">Recent uploads</p>
          {blobs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No blobs yet.</p>
          ) : (
            <ul className="space-y-2">
              {blobs.map((blob) => (
                <li
                  key={blob.url}
                  className="rounded-md border px-3 py-2 text-xs"
                >
                  <a
                    href={blob.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono underline-offset-2 hover:underline"
                  >
                    {blob.pathname}
                  </a>
                  <div className="mt-1 flex items-center justify-between text-muted-foreground">
                    <span>{formatBytes(blob.size)}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(blob.url)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
