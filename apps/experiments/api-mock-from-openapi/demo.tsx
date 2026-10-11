'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { downloadText, SAMPLE_OPENAPI, type MockBundle } from './logic';

export default function ApiMockFromOpenapiDemo() {
  const [openapi, setOpenapi] = useState(SAMPLE_OPENAPI);
  const [bundle, setBundle] = useState<MockBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setBundle(null);
    try {
      const res = await fetch('/api/mock', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ openapi }),
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
      const { provider: _p, ...rest } = data as MockBundle & { provider: string };
      setBundle(rest);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="API mock from OpenAPI"
      description="Paste an OpenAPI snippet. Generate mock Route Handler stubs and download them as text."
      onReset={() => {
        setOpenapi(SAMPLE_OPENAPI);
        setBundle(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="OpenAPI (YAML or JSON)" htmlFor="openapi">
          <Textarea
            id="openapi"
            value={openapi}
            onChange={(e) => setOpenapi(e.target.value)}
            className="min-h-40 font-mono text-xs"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
            {loading ? 'Generating…' : 'Generate mocks'}
          </Button>
          {bundle ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadText('route-handler-mocks.ts', bundle.downloadText)}
            >
              Download stubs
            </Button>
          ) : null}
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {bundle ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <p>{bundle.summary}</p>
            <ul className="space-y-1 text-xs text-fd-muted-foreground">
              {bundle.routes.map((r, i) => (
                <li key={i}>
                  {r.method} {r.path} - {r.handlerFilename}
                </li>
              ))}
            </ul>
            <pre className="max-h-80 overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
              {bundle.downloadText}
            </pre>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
