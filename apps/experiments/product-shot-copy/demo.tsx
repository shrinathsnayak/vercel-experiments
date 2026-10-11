'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { ogQuery, type ProductCopy } from './logic';

export default function ProductShotCopyDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [copy, setCopy] = useState<ProductCopy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!file) { setError('Choose an image first.'); return; }
    setLoading(true); setError(null); setCopy(null);
    try {
      const form = new FormData(); form.set('file', file);
      const res = await fetch('/api/copy', { method: 'POST', body: form });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setCopy(data.copy as ProductCopy);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Product shot copy" description="Image - title/bullets + optional OG preview."
      onReset={() => { setFile(null); setCopy(null); setError(null); }}>
      <div className="space-y-4">
        <Field label="Product image" htmlFor="img">
          <Input id="img" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Writing…' : 'Generate copy'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {copy ? (
          <div className="space-y-3">
            <div className="rounded-md border border-fd-border p-3 text-sm">
              <p className="font-medium">{copy.title}</p>
              <p className="text-fd-muted-foreground">{copy.tagline}</p>
              <ul className="mt-2 list-disc pl-5">{copy.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ogQuery(copy)} alt="OG preview" className="w-full rounded-md border border-fd-border" />
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
