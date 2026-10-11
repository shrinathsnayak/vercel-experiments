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
import { cn } from './ui/utils';
import {
  createLimiter,
  simulateRequests,
  type RateLimitAlgorithm,
} from './logic';

const algorithms: RateLimitAlgorithm[] = [
  'fixed-window',
  'sliding-window',
  'token-bucket',
  'leaky-bucket',
];

export default function RateLimitingSimulatorDemo() {
  const [algorithm, setAlgorithm] = useState<RateLimitAlgorithm>('fixed-window');
  const [limit, setLimit] = useState(5);
  const [windowMs, setWindowMs] = useState(1000);
  const [burst, setBurst] = useState(5);
  const [requestCount, setRequestCount] = useState(12);
  const [intervalMs, setIntervalMs] = useState(100);
  const [liveResult, setLiveResult] = useState<string | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);

  const series = useMemo(() => {
    const limiter = createLimiter(algorithm, { limit, windowMs, burst });
    return simulateRequests(limiter, requestCount, 0, intervalMs);
  }, [algorithm, limit, windowMs, burst, requestCount, intervalMs]);

  const compare = useMemo(() => {
    return algorithms.map((name) => {
      const limiter = createLimiter(name, { limit, windowMs, burst });
      const results = simulateRequests(limiter, requestCount, 0, intervalMs);
      const accepted = results.filter((r) => r.result.allowed).length;
      return { name, accepted, rejected: results.length - accepted };
    });
  }, [limit, windowMs, burst, requestCount, intervalMs]);

  async function hitLiveRedis() {
    setLiveError(null);
    const res = await fetch('/api/rate-limit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        bucket: 'rate-limit-lab',
        limit,
        windowSeconds: Math.max(1, Math.round(windowMs / 1000)),
      }),
    });
    const data = await res.json();
    if (res.status === 503) {
      setLiveError((data as { setup?: string }).setup ?? 'Redis not configured');
      setLiveResult(null);
      return;
    }
    setLiveResult(JSON.stringify(data, null, 2));
  }

  return (
    <DemoShell
      title="Rate limiting simulator"
      description="Compare algorithms locally, then exercise a live Upstash Redis fixed-window limiter."
      onReset={() => {
        setAlgorithm('fixed-window');
        setLimit(5);
        setWindowMs(1000);
        setBurst(5);
        setRequestCount(12);
        setIntervalMs(100);
        setLiveResult(null);
        setLiveError(null);
      }}
    >
      <DemoStatus tone="neutral">
        Simulator is educational. Live Redis mode requires Marketplace Upstash (one-click Deploy).
      </DemoStatus>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Algorithm">
            <Select
              value={algorithm}
              onValueChange={(v) => setAlgorithm(v as RateLimitAlgorithm)}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {algorithms.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Limit" value={limit} onChange={setLimit} min={1} max={100} />
            <NumberField label="Window (ms)" value={windowMs} onChange={setWindowMs} min={100} max={60000} />
            <NumberField label="Burst" value={burst} onChange={setBurst} min={1} max={100} />
            <NumberField label="Requests" value={requestCount} onChange={setRequestCount} min={1} max={50} />
            <NumberField label="Interval (ms)" value={intervalMs} onChange={setIntervalMs} min={10} max={2000} />
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={hitLiveRedis}>
            Hit live Redis limiter
          </Button>
          {liveError ? <DemoStatus tone="warning">{liveError}</DemoStatus> : null}
          {liveResult ? (
            <pre className="overflow-x-auto rounded-md border bg-muted/40 p-2 text-xs">{liveResult}</pre>
          ) : null}
        </div>
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            Timeline
          </h3>
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {series.map((row) => (
              <li
                key={row.index}
                className={cn(
                  'rounded border px-2 py-1 text-xs font-mono',
                  row.result.allowed
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-red-500/30 bg-red-500/10',
                )}
              >
                #{row.index} @ {row.at}ms - {row.result.allowed ? 'accepted' : 'rejected'}
              </li>
            ))}
          </ul>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            Algorithm comparison
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-fd-muted-foreground">
                <th className="py-1">Algorithm</th>
                <th>Accepted</th>
                <th>Rejected</th>
              </tr>
            </thead>
            <tbody>
              {compare.map((row) => (
                <tr key={row.name} className="border-t border-fd-border">
                  <td className="py-1 font-mono">{row.name}</td>
                  <td>{row.accepted}</td>
                  <td>{row.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DemoShell>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        min={min}
        max={max}
        className="text-xs"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}
