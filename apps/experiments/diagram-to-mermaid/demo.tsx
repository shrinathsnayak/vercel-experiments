'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SAMPLE_DESC, type MermaidResult } from './logic';

export default function DiagramToMermaidDemo() {
  const [description, setDescription] = useState(SAMPLE_DESC);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<MermaidResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setResult(null);
    try {
      const form = new FormData();
      form.set('description', description);
      if (file) form.set('file', file);
      const res = await fetch('/api/mermaid', { method: 'POST', body: form });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setResult(data.result as MermaidResult);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Diagram to Mermaid" description="Description or image - Mermaid + accuracy caveat."
      onReset={() => { setDescription(SAMPLE_DESC); setFile(null); setResult(null); setError(null); }}>
      <div className="space-y-4">
        <Field label="Description" htmlFor="desc">
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24 text-sm" />
        </Field>
        <Field label="Diagram image (optional)" htmlFor="img">
          <Input id="img" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Generating…' : 'Generate Mermaid'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-2">
            <DemoStatus tone="warning">{result.caveat}</DemoStatus>
            <pre className="overflow-x-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">{result.mermaid}</pre>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
