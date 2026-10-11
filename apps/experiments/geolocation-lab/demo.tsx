'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { GEO_HEADERS, geoSnippet, type LocalizedDemo } from './logic';

type GeoResponse = {
  headers: Record<string, string>;
  localized: LocalizedDemo;
  note: string;
};

export default function GeolocationLabDemo() {
  const [data, setData] = useState<GeoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/geo');
      const json = (await res.json()) as GeoResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load geo');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loc = data?.localized;

  return (
    <DemoShell
      title="Geolocation lab"
      description="Read Vercel request geo headers and demo Intl currency/date localization."
      example={geoSnippet()}
      onReset={() => void load()}
    >
      {loc?.source === 'vercel-headers' ? (
        <DemoStatus tone="success">Live Vercel geo headers detected.</DemoStatus>
      ) : (
        <DemoStatus tone="warning">
          {data?.note ??
            'Geo headers are set by Vercel at the edge. Local and non-Vercel hosts usually see fallbacks.'}
        </DemoStatus>
      )}
      {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-2xl font-semibold tracking-tight">{loc?.greeting ?? '…'}</p>
          <p className="text-sm text-muted-foreground">
            {loc ? `${loc.city}, ${loc.country} · ${loc.timezone}` : 'Loading…'}
          </p>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4 border-b pb-1">
              <dt className="text-muted-foreground">Currency sample</dt>
              <dd className="font-mono">{loc?.formattedCurrency ?? '-'}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b pb-1">
              <dt className="text-muted-foreground">Local date</dt>
              <dd className="text-right font-mono text-xs">{loc?.formattedDate ?? '-'}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b pb-1">
              <dt className="text-muted-foreground">Locale</dt>
              <dd className="font-mono">{loc?.locale ?? '-'}</dd>
            </div>
          </dl>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Documented headers
          </p>
          <ul className="space-y-1 font-mono text-xs">
            {GEO_HEADERS.map((h) => (
              <li key={h} className="flex justify-between gap-2 rounded border px-2 py-1">
                <span>{h}</span>
                <span className="text-muted-foreground">{data?.headers[h] ?? '-'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DemoShell>
  );
}
