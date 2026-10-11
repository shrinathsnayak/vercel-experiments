'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { SAMPLE_PAYLOAD, type Job } from './logic';

export default function JobQueueLiteDemo() {
  const [payload, setPayload] = useState(SAMPLE_PAYLOAD);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (res.ok) {
        setJobs(data.jobs as Job[]);
        setNote(typeof data.note === 'string' ? data.note : null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function enqueue() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Enqueue failed.');
        return;
      }
      setJobs(data.jobs as Job[]);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  async function drain() {
    setError(null);
    try {
      const res = await fetch('/api/drain?run=1');
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Drain failed.');
        return;
      }
      setJobs(data.jobs as Job[]);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    }
  }

  return (
    <DemoShell
      title="Job queue lite"
      description="Enqueue jobs in Redis/memory, drain via Cron-style Route Handler, watch progress in the UI."
      onReset={() => {
        setPayload(SAMPLE_PAYLOAD);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Job payload" htmlFor="payload">
          <Input id="payload" value={payload} onChange={(e) => setPayload(e.target.value)} />
        </Field>
        <p className="text-xs text-fd-muted-foreground">
          Tip: include <code>fail-me</code> in the payload to simulate a failure on drain.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={enqueue}>
            {loading ? 'Enqueueing…' : 'Enqueue'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={drain}>
            Drain one step
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => void refresh()}>
            Refresh
          </Button>
        </div>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <ul className="space-y-2">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">
                  {job.status} · {job.progress}%
                </p>
                <p className="text-xs text-fd-muted-foreground">{job.id}</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded bg-fd-border">
                <div
                  className="h-full bg-fd-primary transition-all"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-fd-muted-foreground">{job.payload}</p>
              {job.error ? <p className="mt-1 text-xs text-red-600">{job.error}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}
