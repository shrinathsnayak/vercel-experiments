'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  getStrategyLabel,
  simulateCacheTimeline,
  type CacheStrategy,
} from './logic';

export default function CacheBehaviorExplorerDemo() {
  const [strategy, setStrategy] = useState<CacheStrategy>('max-age-short');
  const [mode, setMode] = useState<'simulated' | 'http'>('simulated');
  const [requestCount, setRequestCount] = useState(5);
  const [intervalSec, setIntervalSec] = useState(8);
  const [httpLog, setHttpLog] = useState<string>('');

  const timeline = useMemo(
    () => simulateCacheTimeline(strategy, requestCount, intervalSec),
    [strategy, requestCount, intervalSec],
  );

  async function runHttpProbe() {
    setHttpLog('Fetching…');
    const res = await fetch(`/api/cache-demo?strategy=${strategy}`, { cache: 'default' });
    const data = await res.json();
    const cc = res.headers.get('cache-control') ?? '(none)';
    setHttpLog(
      JSON.stringify(
        {
          status: res.status,
          cacheControl: cc,
          body: data,
        },
        null,
        2,
      ),
    );
  }

  return (
    <DemoShell
      title="Cache behavior explorer"
      description="Compare Cache-Control strategies with a deterministic simulator or real fetches to /api/cache-demo."
      onReset={() => {
        setStrategy('max-age-short');
        setMode('simulated');
        setRequestCount(5);
        setIntervalSec(8);
        setHttpLog('');
      }}
    >
      <div className="space-y-4">
        <Field label="Strategy">
          <Select
            value={strategy}
            onValueChange={(v) => setStrategy(v as CacheStrategy)}
          >
            <SelectTrigger className="w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-store">no-store</SelectItem>
              <SelectItem value="max-age-short">max-age (10s)</SelectItem>
              <SelectItem value="max-age-long">max-age (120s)</SelectItem>
              <SelectItem value="stale-while-revalidate">stale-while-revalidate</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <p className="text-xs text-fd-muted-foreground">{getStrategyLabel(strategy)}</p>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Explorer mode">
          {(['simulated', 'http'] as const).map((m) => (
            <Button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              variant={mode === m ? 'secondary' : 'outline'}
              size="sm"
              className="capitalize"
              onClick={() => setMode(m)}
            >
              {m === 'simulated' ? 'Simulated timeline' : 'Real HTTP fetch'}
            </Button>
          ))}
        </div>

        {mode === 'simulated' ? (
          <>
            <DemoStatus tone="warning">
              Simulated mode - educational state machine only, not Vercel CDN telemetry.
            </DemoStatus>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Requests">
                <Input
                  type="number"
                  min={1}
                  max={12}
                  className="text-xs"
                  value={requestCount}
                  onChange={(e) => setRequestCount(Number(e.target.value))}
                />
              </Field>
              <Field label="Seconds between requests">
                <Input
                  type="number"
                  min={1}
                  max={60}
                  className="text-xs"
                  value={intervalSec}
                  onChange={(e) => setIntervalSec(Number(e.target.value))}
                />
              </Field>
            </div>
            <ol className="space-y-2">
              {timeline.map((row) => (
                <li
                  key={row.step}
                  className="rounded-md border border-fd-border px-3 py-2 text-xs"
                >
                  <span className="font-mono font-semibold">#{row.step}</span>{' '}
                  <span className="uppercase text-fd-muted-foreground">{row.state}</span> - {row.note}
                </li>
              ))}
            </ol>
          </>
        ) : (
          <>
            <DemoStatus tone="neutral">
              Real HTTP mode hits this deployment’s API route. Browser cache may affect repeat fetches.
            </DemoStatus>
            <Button type="button" variant="outline" size="sm" onClick={runHttpProbe}>
              Fetch /api/cache-demo
            </Button>
            <pre className="overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
              {httpLog || 'Run a fetch to inspect response headers.'}
            </pre>
          </>
        )}
      </div>
    </DemoShell>
  );
}
