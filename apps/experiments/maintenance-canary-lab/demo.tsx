'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { maintenanceSnippet } from './logic';

type Counts = { control: number; canary: number; maintenance: number; backend: string };

export default function MaintenanceCanaryLabDemo() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [canaryPercent, setCanaryPercent] = useState(25);
  const [cookie, setCookie] = useState<string | null>(null);
  const [last, setLast] = useState<string>('');
  const [counts, setCounts] = useState<Counts | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/canary');
    const data = await res.json();
    setCounts(data.counts);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function assign() {
    const res = await fetch('/api/canary', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'assign',
        maintenanceMode,
        canaryPercent,
        existingCookie: cookie,
      }),
    });
    const data = await res.json();
    setLast(JSON.stringify(data, null, 2));
    if (data.assignment?.cookieValue && data.assignment.cookieValue !== 'maintenance') {
      setCookie(data.assignment.cookieValue);
    }
    setCounts(data.counts);
  }

  return (
    <DemoShell
      title="Maintenance / canary lab"
      description="Env or Global Config kill switch plus percentage canary cookie assignment with two UI variants."
      example={maintenanceSnippet()}
      onReset={() => {
        setCookie(null);
        setLast('');
        void refresh();
      }}
    >
      <DemoStatus tone="neutral">
        Real <code className="text-xs">proxy.ts</code> rewrites <code className="text-xs">/variant</code> and{' '}
        <code className="text-xs">/maintenance</code>. Simulator below also drives counters (Redis optional).
      </DemoStatus>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            <Label>Maintenance kill switch</Label>
          </label>
          <Field label={`Canary percent (${canaryPercent}%)`}>
            <Input
              type="number"
              min={0}
              max={100}
              value={canaryPercent}
              onChange={(e) => setCanaryPercent(Number(e.target.value))}
            />
          </Field>
          <p className="text-xs text-muted-foreground">Sticky cookie: {cookie ?? '(none)'}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void assign()}>
              Assign / hit
            </Button>
            <Button type="button" variant="outline" onClick={() => setCookie(null)}>
              Clear cookie
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href="/variant" target="_blank" rel="noreferrer">
                Open /variant
              </a>
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium">
            Counters ({counts?.backend ?? '…'}): control {counts?.control ?? 0} · canary {counts?.canary ?? 0} ·
            maintenance {counts?.maintenance ?? 0}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded border p-3">
              <p className="text-xs uppercase text-muted-foreground">Control</p>
              <p className="font-semibold">Classic checkout</p>
            </div>
            <div className="rounded border border-sky-500/40 bg-sky-500/5 p-3">
              <p className="text-xs uppercase text-sky-700 dark:text-sky-300">Canary</p>
              <p className="font-semibold">New checkout</p>
            </div>
          </div>
          <pre className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">{last || 'Run an assignment.'}</pre>
        </div>
      </div>
    </DemoShell>
  );
}
