'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import {
  downloadText,
  SAMPLE_CSV,
  SAMPLE_JSON,
  type SchemaOutput,
} from './logic';

export default function SchemaFromSampleLabDemo() {
  const [sample, setSample] = useState(SAMPLE_JSON);
  const [result, setResult] = useState<(SchemaOutput & { detectedKind?: string }) | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/schema', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sample }),
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
      const { provider: _p, ...rest } = data as SchemaOutput & {
        provider: string;
        detectedKind?: string;
      };
      setResult(rest);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Schema from sample lab"
      description="Paste JSON or CSV. Get TypeScript types and Zod schema strings you can download."
      onReset={() => {
        setSample(SAMPLE_JSON);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setSample(SAMPLE_JSON)}>
            Load JSON sample
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setSample(SAMPLE_CSV)}>
            Load CSV sample
          </Button>
        </div>
        <Field label="Sample" htmlFor="sample">
          <Textarea
            id="sample"
            value={sample}
            onChange={(e) => setSample(e.target.value)}
            className="min-h-32 font-mono text-xs"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
            {loading ? 'Inferring…' : 'Infer schema'}
          </Button>
          {result ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadText('types.ts', result.typescript)}
              >
                Download types.ts
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadText('schema.ts', result.zod)}
              >
                Download schema.ts
              </Button>
            </>
          ) : null}
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            {result.detectedKind ? (
              <p className="text-xs text-fd-muted-foreground">detected: {result.detectedKind}</p>
            ) : null}
            <pre className="max-h-48 overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
              {result.typescript}
            </pre>
            <pre className="max-h-48 overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
              {result.zod}
            </pre>
            {result.notes.length > 0 ? (
              <ul className="list-disc pl-5 text-fd-muted-foreground">
                {result.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
