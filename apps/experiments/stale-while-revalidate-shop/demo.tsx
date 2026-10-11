'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import {
  DEFAULT_MAX_AGE,
  DEFAULT_SWR,
  simulateSwrTimeline,
  type CatalogItem,
} from './logic';

export default function StaleWhileRevalidateShopDemo() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [headers, setHeaders] = useState<string | null>(null);
  const [storage, setStorage] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const timeline = useMemo(
    () => simulateSwrTimeline(DEFAULT_MAX_AGE, DEFAULT_SWR, 6, 8),
    [],
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/catalog', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Load failed.');
        return;
      }
      setCatalog(Array.isArray(data.items) ? data.items : []);
      setHeaders(res.headers.get('cache-control'));
      setStorage(typeof data.storage === 'string' ? data.storage : null);
      setGeneratedAt(typeof data.generatedAt === 'string' ? data.generatedAt : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Stale-while-revalidate shop"
      description="Catalog API with SWR Cache-Control, Redis/memory backing, and a freshness timeline."
      onReset={() => {
        setCatalog([]);
        setHeaders(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={load}>
          {loading ? 'Loading…' : 'Fetch catalog'}
        </Button>
        {headers ? <DemoStatus tone="success">Cache-Control: {headers}</DemoStatus> : null}
        {storage ? <DemoStatus tone="warning">Backing store: {storage}</DemoStatus> : null}
        {generatedAt ? <p className="font-mono text-xs">generatedAt: {generatedAt}</p> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {catalog.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {catalog.map((item) => (
              <li key={item.id} className="rounded-md border border-fd-border px-3 py-2">
                {item.name} · stock {item.stock}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            Freshness timeline (simulated)
          </h3>
          {timeline.map((t) => (
            <p key={t.tick} className="text-xs">
              t{t.tick} age={t.age}s · <strong>{t.state}</strong> — {t.note}
            </p>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
