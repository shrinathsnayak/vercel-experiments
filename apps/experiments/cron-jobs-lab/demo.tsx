'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { cronRouteSnippet, describeCronSchedule } from './logic';

type Status = {
  storage: string;
  last: { ranAt: string; path: string; schedule: string } | null;
  schedule: string;
  route: string;
  note?: string;
};

export default function CronJobsLabDemo() {
  const [status, setStatus] = useState<Status | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/cron/status');
    const data = (await res.json()) as Status;
    setStatus(data);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function runNow() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/cron/heartbeat');
      const data = (await res.json()) as { error?: string; ranAt?: string; storage?: string };
      if (!res.ok) {
        setMessage(data.error ?? 'Cron run failed');
        return;
      }
      setMessage(`Heartbeat stored via ${data.storage} at ${data.ranAt}`);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Cron jobs lab"
      description="Vercel Cron hits a Route Handler on a schedule - persistence via Redis or Blob when available."
      example={cronRouteSnippet()}
      onReset={() => {
        setMessage(null);
        void refresh();
      }}
    >
      <DemoStatus tone="neutral">
        Schedule:{' '}
        <code className="font-mono">
          {status?.schedule ?? '0 * * * *'}
        </code>{' '}
        - {describeCronSchedule(status?.schedule ?? '0 * * * *')}
      </DemoStatus>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={runNow} disabled={loading}>
            {loading ? 'Running…' : 'Run heartbeat now'}
          </Button>
          <Button type="button" variant="outline" onClick={refresh}>
            Refresh status
          </Button>
        </div>
        {message ? <DemoStatus tone="success">{message}</DemoStatus> : null}
        <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
          {JSON.stringify(status, null, 2)}
        </pre>
        {status?.note ? (
          <p className="text-xs text-muted-foreground">{status.note}</p>
        ) : null}
      </div>
    </DemoShell>
  );
}
