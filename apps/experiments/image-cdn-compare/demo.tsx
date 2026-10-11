'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { formatBytes, SAMPLE_PATH, type CompareRow } from './logic';

export default function ImageCdnCompareDemo() {
  const [path, setPath] = useState(SAMPLE_PATH);
  const [width, setWidth] = useState(1080);
  const [quality, setQuality] = useState(75);
  const [rows, setRows] = useState<CompareRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function compare() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path, width, quality }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Compare failed.');
        return;
      }
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Image CDN compare"
      description="Same public asset: raw URL vs /_next/image — size and Content-Type table."
      onReset={() => {
        setPath(SAMPLE_PATH);
        setWidth(1080);
        setQuality(75);
        setRows([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-md border">
          <Image
            src={path.startsWith('/') ? path : SAMPLE_PATH}
            alt="Sample asset"
            width={Math.min(width, 1200)}
            height={Math.round((Math.min(width, 1200) * 9) / 16)}
            quality={quality}
            className="h-auto w-full object-cover"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Path" htmlFor="path">
            <Input id="path" className="font-mono text-xs" value={path} onChange={(e) => setPath(e.target.value)} />
          </Field>
          <Field label="Width" htmlFor="w">
            <Input
              id="w"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value) || 1080)}
            />
          </Field>
          <Field label="Quality" htmlFor="q">
            <Input
              id="q"
              type="number"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value) || 75)}
            />
          </Field>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={compare}>
          {loading ? 'Measuring…' : 'Compare bytes'}
        </Button>
        <DemoStatus tone="warning">
          SVG samples often skip optimizer compression; use a raster asset in production for clearer wins.
        </DemoStatus>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {rows.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-fd-muted-foreground">
                <th className="py-1">Variant</th>
                <th>Type</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-fd-border align-top">
                  <td className="py-2 pr-2">
                    <div className="font-medium">{r.label}</div>
                    <div className="break-all font-mono text-[10px] text-fd-muted-foreground">{r.url}</div>
                    <div className="text-xs text-fd-muted-foreground">{r.note}</div>
                  </td>
                  <td className="pr-2 font-mono text-xs">{r.contentType ?? '—'}</td>
                  <td>{formatBytes(r.bytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </DemoShell>
  );
}
