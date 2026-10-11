'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DEFAULT_FLAG_KEY,
  evaluateLocalFlag,
  flagsSdkSnippet,
} from './logic';

type ApiResult = {
  ok?: boolean;
  source?: string;
  value?: boolean | string | number;
  reason?: string;
  setup?: string;
  error?: string;
  note?: string;
  bucket?: number;
};

export default function VercelFlagsLabDemo() {
  const [flagKey, setFlagKey] = useState(DEFAULT_FLAG_KEY);
  const [userId, setUserId] = useState('user-7f3a');
  const [plan, setPlan] = useState('standard');
  const [enabled, setEnabled] = useState(true);
  const [rollout, setRollout] = useState(30);
  const [live, setLive] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const local = useMemo(
    () =>
      evaluateLocalFlag(
        {
          key: flagKey,
          type: 'boolean',
          defaultValue: false,
          enabled,
          rolloutPercent: rollout,
          plans: ['enterprise', 'beta'],
        },
        { user: { id: userId, plan } },
      ),
    [flagKey, userId, plan, enabled, rollout],
  );

  async function evaluateLive() {
    setLoading(true);
    setLive(null);
    try {
      const res = await fetch('/api/flags/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          key: flagKey,
          userId,
          plan,
        }),
      });
      setLive((await res.json()) as ApiResult);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Vercel Flags lab"
      description="Evaluate platform-native Vercel Flags with entity targeting - local sticky simulator plus live @vercel/flags-core evaluation."
      example={flagsSdkSnippet()}
      onReset={() => {
        setFlagKey(DEFAULT_FLAG_KEY);
        setUserId('user-7f3a');
        setPlan('standard');
        setEnabled(true);
        setRollout(30);
        setLive(null);
      }}
    >
      <DemoStatus tone="neutral">
        Platform Flags path (
        <code className="font-mono">flags</code> +{' '}
        <code className="font-mono">@flags-sdk/vercel</code>
        ). Pair with Global Config Lab for ultra-low-latency config reads.
      </DemoStatus>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Flag key">
            <Input
              className="text-xs font-mono"
              value={flagKey}
              onChange={(e) => setFlagKey(e.target.value)}
            />
          </Field>
          <Field label="User ID (entity)">
            <Input
              className="text-xs font-mono"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </Field>
          <Field label="user.plan">
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">standard</SelectItem>
                <SelectItem value="enterprise">enterprise</SelectItem>
                <SelectItem value="beta">beta</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={`Rollout ${rollout}%`}>
            <Slider
              value={[rollout]}
              min={0}
              max={100}
              step={1}
              onValueChange={(v) => setRollout(v[0] ?? 0)}
            />
          </Field>
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} id="en" />
            <Label htmlFor="en" className="text-xs">
              Flag enabled
            </Label>
          </div>
          <Button type="button" onClick={evaluateLive} disabled={loading}>
            {loading ? 'Evaluating…' : 'Evaluate via Vercel Flags'}
          </Button>
        </div>

        <div className="space-y-3">
          <DemoStatus tone={local.value ? 'success' : 'neutral'}>
            Local: <strong>{String(local.value)}</strong> - {local.reason} (bucket{' '}
            {local.bucket})
          </DemoStatus>
          {live ? (
            <DemoStatus tone={live.ok === false ? 'warning' : 'success'}>
              Live: {live.ok === false
                ? (live.setup ?? live.error ?? 'unavailable')
                : `${String(live.value)} (${live.source}) - ${live.reason ?? ''}`}
            </DemoStatus>
          ) : null}
          <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
            {JSON.stringify({ local, live }, null, 2)}
          </pre>
        </div>
      </div>
    </DemoShell>
  );
}
