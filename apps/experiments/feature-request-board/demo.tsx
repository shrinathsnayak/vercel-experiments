'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_IDEAS, type IdeaCluster } from './logic';

export default function FeatureRequestBoardDemo() {
  const [ideas, setIdeas] = useState(SAMPLE_IDEAS);
  const [clusters, setClusters] = useState<IdeaCluster[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshVotes = useCallback(async () => {
    try {
      const res = await fetch('/api/vote');
      const data = await res.json();
      if (res.ok) {
        setVotes((data.votes as Record<string, number>) ?? {});
        setNote(typeof data.note === 'string' ? data.note : null);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { void refreshVotes(); }, [refreshVotes]);

  async function cluster() {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/cluster', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ideas }),
      });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(typeof data.error === 'string' ? data.error : 'Cluster failed.'); return; }
      setClusters(data.clusters as IdeaCluster[]);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  async function vote(clusterId: string) {
    setError(null);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ clusterId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.error === 'string' ? data.error : 'Vote failed.'); return; }
      setVotes((data.votes as Record<string, number>) ?? {});
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch { setError('Network error.'); }
  }

  return (
    <DemoShell title="Feature request board" description="Paste ideas - AI clusters - Redis/memory votes."
      onReset={() => { setIdeas(SAMPLE_IDEAS); setClusters([]); setError(null); }}>
      <div className="space-y-4">
        <Field label="Ideas (one per line)" htmlFor="ideas">
          <Textarea id="ideas" value={ideas} onChange={(e) => setIdeas(e.target.value)} className="min-h-36 text-sm" />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={cluster}>
          {loading ? 'Clustering…' : 'Cluster ideas'}
        </Button>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <ul className="space-y-2">
          {clusters.map((c) => (
            <li key={c.id} className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{c.theme}</p>
                  <p className="mt-1 text-fd-muted-foreground">{c.summary}</p>
                  <p className="mt-1 text-xs text-fd-muted-foreground">votes: {votes[c.id] ?? 0}</p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => vote(c.id)}>Vote</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}
