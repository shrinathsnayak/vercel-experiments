'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { abSnippet, conversionRate, type AbVariant, type FunnelStats } from './logic';

export default function AbTestingLabDemo() {
  const [variant, setVariant] = useState<AbVariant | null>(null);
  const [stats, setStats] = useState<(FunnelStats & { backend?: string }) | null>(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/ab');
    setStats(await res.json());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function assign() {
    const res = await fetch('/api/ab', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'assign', existing: variant }),
    });
    const data = await res.json();
    setVariant(data.assignment.variant);
    setStats(data.stats);
    setMsg(`Assigned ${data.assignment.variant} (sticky=${data.assignment.sticky}) via ${data.backend}`);
  }

  async function convert() {
    if (!variant) return;
    const res = await fetch('/api/ab', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'convert', variant }),
    });
    const data = await res.json();
    setStats(data.stats);
    setMsg(`Conversion recorded for ${variant}`);
  }

  return (
    <DemoShell
      title="A/B testing lab"
      description="Cookie-sticky A/B assignment with impression and conversion tracking (Redis or memory)."
      example={abSnippet()}
      onReset={() => {
        setVariant(null);
        setMsg('');
        void fetch('/api/ab', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'reset' }),
        }).then(() => load());
      }}
    >
      <DemoStatus tone="neutral">
        Backend: {stats?.backend ?? '…'}. Sticky cookie <code className="text-xs">ve-ab</code> keeps the cohort stable.
      </DemoStatus>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div
            className={
              variant === 'B'
                ? 'rounded-lg border border-violet-500/40 bg-violet-500/5 p-6'
                : 'rounded-lg border p-6'
            }
          >
            <p className="text-xs uppercase text-muted-foreground">Active variant</p>
            <h2 className="mt-1 text-3xl font-semibold">{variant ?? '-'}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {variant === 'B' ? 'Bold CTA · new copy' : variant === 'A' ? 'Classic CTA · control copy' : 'Assign to start'}
            </p>
            {variant ? (
              <Button className="mt-4" type="button" onClick={() => void convert()}>
                Convert
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void assign()}>
              Assign / impress
            </Button>
            <Button type="button" variant="outline" onClick={() => void load()}>
              Refresh stats
            </Button>
          </div>
          {msg ? <p className="text-xs text-muted-foreground">{msg}</p> : null}
        </div>
        <div className="space-y-2 text-sm">
          {(['A', 'B'] as const).map((v) => (
            <div key={v} className="rounded border p-3">
              <p className="font-medium">Variant {v}</p>
              <p className="text-muted-foreground">
                impressions {stats?.impressions[v] ?? 0} · conversions {stats?.conversions[v] ?? 0} · rate{' '}
                {stats ? `${(conversionRate(stats, v) * 100).toFixed(1)}%` : '-'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
