'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import type { Product } from './logic';

export default function OgFromDatabaseDemo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState('Queue Relay');
  const [description, setDescription] = useState(
    'Publish durable messages with @vercel/queue and a private consumer.',
  );
  const [selected, setSelected] = useState('edge-cache');
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to load.');
        return;
      }
      const list = data.products as Product[];
      setProducts(list);
      setNote(typeof data.note === 'string' ? data.note : null);
      if (list[0] && !list.some((p) => p.slug === selected)) {
        setSelected(list[0].slug);
      }
    } catch {
      setError('Network error loading products.');
    }
  }, [selected]);

  useEffect(() => {
    void load();
  }, [load]);

  async function seedAdd() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Save failed.');
        return;
      }
      setSelected(data.product.slug as string);
      await load();
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  const ogSrc = selected ? `/api/og?slug=${encodeURIComponent(selected)}` : '';

  return (
    <DemoShell
      title="OG from database"
      description="Seed/list product rows (Neon or in-memory), then render ImageResponse OG cards by slug."
      onReset={() => {
        setTitle('Queue Relay');
        setDescription(
          'Publish durable messages with @vercel/queue and a private consumer.',
        );
        setError(null);
        void load();
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" htmlFor="title">
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Description" htmlFor="desc">
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-16 text-sm"
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={seedAdd}>
            {loading ? 'Saving…' : 'Add / upsert product'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            Refresh list
          </Button>
        </div>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <Field label="Preview slug" htmlFor="slug">
          <select
            id="slug"
            className="w-full rounded-md border border-fd-border bg-background px-3 py-2 text-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.slug} - {p.title}
              </option>
            ))}
          </select>
        </Field>
        {ogSrc ? (
          <div className="space-y-2">
            <p className="text-xs text-fd-muted-foreground font-mono">{ogSrc}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ogSrc}
              alt={`OG for ${selected}`}
              className="w-full max-w-xl rounded-md border border-fd-border"
            />
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
