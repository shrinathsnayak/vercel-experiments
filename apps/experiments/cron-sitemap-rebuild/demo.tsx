'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';

export default function CronSitemapRebuildDemo() {
  const [xml, setXml] = useState('');
  const [storage, setStorage] = useState<string | null>(null);
  const [ranAt, setRanAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function rebuild() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cron/sitemap', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Rebuild failed.');
        return;
      }
      setStorage(typeof data.storage === 'string' ? data.storage : null);
      setRanAt(typeof data.ranAt === 'string' ? data.ranAt : null);
      setXml(typeof data.xml === 'string' ? data.xml : '');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/sitemap.xml', { cache: 'no-store' });
      const text = await res.text();
      if (!res.ok) {
        setError('Could not load sitemap.xml');
        return;
      }
      setXml(text);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Cron sitemap rebuild"
      description="Cron regenerates sitemap.xml from a content list (Neon / Blob / memory)."
      onReset={() => {
        setXml('');
        setStorage(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={rebuild}>
            {loading ? 'Working…' : 'Run rebuild now'}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={loading} onClick={load}>
            Load /sitemap.xml
          </Button>
        </div>
        {storage ? <DemoStatus tone="warning">Storage: {storage}</DemoStatus> : null}
        {ranAt ? <DemoStatus tone="success">Last rebuild: {ranAt}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {xml ? (
          <pre className="max-h-80 overflow-auto rounded-md border border-fd-border p-3 font-mono text-xs">{xml}</pre>
        ) : null}
      </div>
    </DemoShell>
  );
}
