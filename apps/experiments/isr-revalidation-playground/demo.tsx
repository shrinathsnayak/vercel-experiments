'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import {
  isrRouteExample,
  revalidateAfter,
  simulateIsrTimeline,
} from './logic';

export default function IsrRevalidationPlaygroundDemo() {
  const [revalidateSec, setRevalidateSec] = useState(60);
  const [tickCount, setTickCount] = useState(6);
  const [secondsPerTick, setSecondsPerTick] = useState(30);
  const [onDemandTick, setOnDemandTick] = useState<number | ''>('');
  const [mode, setMode] = useState<'simulated' | 'http'>('simulated');
  const [httpLog, setHttpLog] = useState('');

  const timeline = useMemo(
    () =>
      simulateIsrTimeline(revalidateSec, tickCount, secondsPerTick, {
        onDemandTick: onDemandTick === '' ? undefined : onDemandTick,
      }),
    [revalidateSec, tickCount, secondsPerTick, onDemandTick],
  );

  const config = revalidateAfter(revalidateSec);

  async function runHttpProbe() {
    setHttpLog('Fetching…');
    const res = await fetch(`/api/isr-demo?revalidate=${config.revalidate}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    setHttpLog(
      JSON.stringify(
        {
          status: res.status,
          cacheControl: res.headers.get('cache-control'),
          body: data,
        },
        null,
        2,
      ),
    );
  }

  return (
    <DemoShell
      title="ISR revalidation playground"
      description="Explore static regeneration intervals, stale pages, and on-demand revalidation - simulated or via a labeled demo API route."
      example={isrRouteExample(config.revalidate)}
      onReset={() => {
        setRevalidateSec(60);
        setTickCount(6);
        setSecondsPerTick(30);
        setOnDemandTick('');
        setMode('simulated');
        setHttpLog('');
      }}
    >
      <div className="space-y-4">
        <Field label="revalidate (seconds)">
          <Input
            type="number"
            min={0}
            max={3600}
            className="text-xs"
            value={revalidateSec}
            onChange={(e) => setRevalidateSec(Number(e.target.value))}
          />
        </Field>
        <p className="text-xs text-fd-muted-foreground font-mono">
          export const revalidate = {config.revalidate};
        </p>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="ISR demo mode">
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
              {m === 'simulated' ? 'Simulated timeline' : 'Real demo route'}
            </Button>
          ))}
        </div>

        {mode === 'simulated' ? (
          <>
            <DemoStatus tone="warning">
              Simulated freshness states - educational only, not measured ISR telemetry from Vercel.
            </DemoStatus>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Timeline ticks">
                <Input
                  type="number"
                  min={2}
                  max={12}
                  className="text-xs"
                  value={tickCount}
                  onChange={(e) => setTickCount(Number(e.target.value))}
                />
              </Field>
              <Field label="Seconds per tick">
                <Input
                  type="number"
                  min={1}
                  max={120}
                  className="text-xs"
                  value={secondsPerTick}
                  onChange={(e) => setSecondsPerTick(Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="On-demand revalidate at tick (optional)">
              <Input
                type="number"
                min={1}
                max={tickCount}
                placeholder="e.g. 4"
                className="text-xs"
                value={onDemandTick}
                onChange={(e) =>
                  setOnDemandTick(e.target.value === '' ? '' : Number(e.target.value))
                }
              />
            </Field>
            <ol className="space-y-2">
              {timeline.map((row) => (
                <li
                  key={row.tick}
                  className="rounded-md border border-fd-border px-3 py-2 text-xs"
                >
                  <span className="font-mono font-semibold">t={row.elapsedSeconds}s</span>{' '}
                  <span className="uppercase text-fd-muted-foreground">{row.state}</span> - {row.note}
                </li>
              ))}
            </ol>
          </>
        ) : (
          <>
            <DemoStatus tone="neutral">
              Fetches /api/isr-demo with Cache-Control derived from your revalidate value. Response
              headers are real for this route; they are not a guarantee of production CDN behavior.
            </DemoStatus>
            <Button type="button" variant="outline" size="sm" onClick={runHttpProbe}>
              Fetch /api/isr-demo
            </Button>
            <pre className="overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
              {httpLog || 'Run a fetch to inspect demo route headers.'}
            </pre>
          </>
        )}
      </div>
    </DemoShell>
  );
}
