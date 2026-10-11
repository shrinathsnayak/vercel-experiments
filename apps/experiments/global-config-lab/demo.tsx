'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { globalConfigSnippet, SUGGESTED_KEYS, summarizeConfig } from './logic';

export default function GlobalConfigLabDemo() {
  const [key, setKey] = useState<string>('greeting');
  const [value, setValue] = useState<string>('-');
  const [all, setAll] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const loadAll = useCallback(async () => {
    const res = await fetch('/api/global-config');
    const data = (await res.json()) as {
      items?: Record<string, unknown>;
      setup?: string;
      demoDefaults?: Record<string, unknown>;
      error?: string;
    };
    if (res.status === 503) {
      setLive(false);
      setAll(data.demoDefaults ?? null);
      setError(data.setup ?? data.error ?? 'Global Config not configured');
      return;
    }
    setLive(true);
    setError(null);
    setAll(data.items ?? null);
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function readKey() {
    setError(null);
    const res = await fetch(`/api/global-config?key=${encodeURIComponent(key)}`);
    const data = (await res.json()) as {
      value?: unknown;
      setup?: string;
      error?: string;
      demoDefaults?: Record<string, unknown>;
    };
    if (res.status === 503) {
      setLive(false);
      const fallback = data.demoDefaults?.[key];
      setValue(fallback === undefined ? 'undefined' : JSON.stringify(fallback));
      setError(data.setup ?? 'Using local fallback values');
      return;
    }
    setLive(true);
    setValue(data.value === undefined ? 'undefined' : JSON.stringify(data.value));
  }

  const summary = summarizeConfig(all);

  return (
    <DemoShell
      title="Global Config lab"
      description="Ultra-low-latency reads from Vercel Global Config - ideal for flags and kill switches."
      example={globalConfigSnippet()}
      onReset={() => {
        setKey('greeting');
        setValue('-');
        setError(null);
        void loadAll();
      }}
    >
      {live ? (
        <DemoStatus tone="success">Connected to GLOBAL_CONFIG.</DemoStatus>
      ) : (
        <DemoStatus tone="warning">
          Create a Global Config store in the Vercel dashboard and pull GLOBAL_CONFIG. Suggested
          keys: {SUGGESTED_KEYS.join(', ')}.
        </DemoStatus>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Key">
            <Input
              className="font-mono text-xs"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              list="global-config-keys"
            />
            <datalist id="global-config-keys">
              {SUGGESTED_KEYS.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </Field>
          <Button type="button" onClick={readKey}>
            Read key
          </Button>
          <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
            {value}
          </pre>
          {error ? <DemoStatus tone="warning">{error}</DemoStatus> : null}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Store snapshot ({summary.keyCount} keys)</p>
            <Button type="button" variant="outline" size="sm" onClick={loadAll}>
              Refresh
            </Button>
          </div>
          <pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
            {JSON.stringify(all ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </DemoShell>
  );
}
