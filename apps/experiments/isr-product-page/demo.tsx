'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { PRODUCTS, REVALIDATE_SECONDS, productPath } from './logic';

export default function IsrProductPageDemo() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function revalidate(slug: string) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Revalidate failed.');
        return;
      }
      setMessage(`Revalidated ${data.path} at ${data.revalidatedAt}`);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="ISR product page"
      description={`Fake catalog pages with revalidate=${REVALIDATE_SECONDS}s plus on-demand revalidate.`}
      onReset={() => {
        setMessage(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <DemoStatus tone="warning">
          Open a product route, wait past revalidate, or force regeneration with the button.
        </DemoStatus>
        <ul className="space-y-2">
          {PRODUCTS.map((p) => (
            <li key={p.slug} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-fd-border px-3 py-2 text-sm">
              <a className="underline" href={productPath(p.slug)}>
                {p.name} — ${p.price}
              </a>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => revalidate(p.slug)}
              >
                On-demand revalidate
              </Button>
            </li>
          ))}
        </ul>
        {message ? <DemoStatus tone="success">{message}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
      </div>
    </DemoShell>
  );
}
