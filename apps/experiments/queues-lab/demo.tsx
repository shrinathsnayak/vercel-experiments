'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { queuesConsumerSnippet, queuesProducerSnippet } from './logic';

type PublishResponse = {
  ok: boolean;
  mode?: string;
  messageId?: string;
  messageIds?: string[];
  deduped?: boolean;
  note?: string;
  error?: string;
  setup?: string;
  recent?: unknown[];
};

export default function QueuesLabDemo() {
  const [orderId, setOrderId] = useState('order_123');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [useSimulator, setUseSimulator] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublishResponse | null>(null);
  const [status, setStatus] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/queues/publish');
    setStatus(await res.json());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function publish() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/queues/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orderId,
          idempotencyKey: idempotencyKey || undefined,
          mode: useSimulator ? 'simulator' : 'live',
        }),
      });
      const data = (await res.json()) as PublishResponse;
      setResult(data);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Queues lab"
      description="Publish to a durable Vercel Queues topic and process messages with a private push consumer - or explore fan-out and retries in the local simulator."
      example={`${queuesProducerSnippet()}\n\n${queuesConsumerSnippet()}`}
      onReset={() => {
        setOrderId('order_123');
        setIdempotencyKey('');
        setUseSimulator(true);
        setResult(null);
        void refresh();
      }}
    >
      <DemoStatus tone="neutral">
        Topic <code className="font-mono">experiments-orders</code>. Live mode
        uses <code className="font-mono">@vercel/queue</code> + OIDC; simulator
        mode fans out in memory for local learning.
      </DemoStatus>

      <div className="mt-4 space-y-3">
        <Field label="Order ID">
          <Input
            className="text-xs font-mono"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </Field>
        <Field label="Idempotency key (optional)">
          <Input
            className="text-xs font-mono"
            value={idempotencyKey}
            placeholder="dedupe-key"
            onChange={(e) => setIdempotencyKey(e.target.value)}
          />
        </Field>
        <div className="flex items-center gap-2">
          <Switch
            checked={useSimulator}
            onCheckedChange={setUseSimulator}
            id="sim"
          />
          <Label htmlFor="sim" className="text-xs">
            Use in-memory simulator (recommended without OIDC)
          </Label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={publish} disabled={loading || !orderId}>
            {loading ? 'Publishing…' : 'Publish message'}
          </Button>
          <Button type="button" variant="outline" onClick={refresh}>
            Refresh status
          </Button>
        </div>
        {result ? (
          <DemoStatus tone={result.ok ? 'success' : 'warning'}>
            {result.ok
              ? result.deduped
                ? 'Deduped - identical idempotency key already published.'
                : (result.note ?? `Published (${result.mode})`)
              : (result.setup ?? result.error ?? 'Publish failed')}
          </DemoStatus>
        ) : null}
        <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
          {JSON.stringify({ result, status }, null, 2)}
        </pre>
      </div>
    </DemoShell>
  );
}
