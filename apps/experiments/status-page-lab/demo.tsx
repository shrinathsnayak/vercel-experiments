'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import {
  DEFAULT_CHECK_URL,
  type CheckResult,
  type OverallStatus,
} from './logic';

export default function StatusPageLabDemo() {
  const [url, setUrl] = useState(DEFAULT_CHECK_URL);
  const [status, setStatus] = useState<OverallStatus>('unknown');
  const [uptime, setUptime] = useState<number | null>(null);
  const [history, setHistory] = useState<CheckResult[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (res.ok) {
        setStatus(data.status as OverallStatus);
        setUptime(typeof data.uptimePercent === 'number' ? data.uptimePercent : null);
        setHistory((data.history as CheckResult[]) ?? []);
        setNote(typeof data.note === 'string' ? data.note : null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function runCheck() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Check failed.');
        return;
      }
      setHistory((data.history as CheckResult[]) ?? []);
      setNote(typeof data.note === 'string' ? data.note : null);
      await refresh();
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Status page lab"
      description="Synthetic URL checks with Redis/memory history and a public status summary."
      onReset={() => {
        setUrl(DEFAULT_CHECK_URL);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <div className="rounded-md border border-fd-border p-4">
          <p className="text-xs uppercase tracking-wide text-fd-muted-foreground">Status</p>
          <p className="mt-1 text-2xl font-medium capitalize">{status}</p>
          {uptime != null ? (
            <p className="mt-1 text-sm text-fd-muted-foreground">Uptime (sample): {uptime}%</p>
          ) : null}
        </div>
        <Field label="Check URL" htmlFor="url">
          <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={runCheck}>
          {loading ? 'Checking…' : 'Run check'}
        </Button>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <ul className="space-y-2 text-sm">
          {history.map((h) => (
            <li
              key={h.id}
              className="flex justify-between gap-2 rounded-md border border-fd-border px-3 py-2"
            >
              <span>
                {h.ok ? 'OK' : 'FAIL'} {h.status ?? '-'} · {h.latencyMs}ms
              </span>
              <span className="text-xs text-fd-muted-foreground">{h.checkedAt}</span>
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}
