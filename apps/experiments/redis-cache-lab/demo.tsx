'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { clampTtl, redisSnippet } from './logic';

export default function RedisCacheLabDemo() {
  const [key, setKey] = useState('greeting');
  const [value, setValue] = useState('hello from upstash');
  const [ttl, setTtl] = useState(60);
  const [result, setResult] = useState<string>('-');
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  async function setCache() {
    setError(null);
    const res = await fetch('/api/redis/cache', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key, value, ttlSeconds: clampTtl(ttl) }),
    });
    const data = (await res.json()) as { setup?: string; error?: string; ok?: boolean };
    if (!res.ok) {
      setLive(false);
      setError(data.setup ?? data.error ?? 'Set failed');
      return;
    }
    setLive(true);
    setResult(`Set ${key} (ttl ${clampTtl(ttl)}s)`);
  }

  async function getCache() {
    setError(null);
    const res = await fetch(`/api/redis/cache?key=${encodeURIComponent(key)}`);
    const data = (await res.json()) as {
      value?: string | null;
      ttlSeconds?: number;
      setup?: string;
      error?: string;
    };
    if (!res.ok) {
      setLive(false);
      setError(data.setup ?? data.error ?? 'Get failed');
      return;
    }
    setLive(true);
    setResult(
      JSON.stringify(
        { value: data.value, ttlSeconds: data.ttlSeconds },
        null,
        2,
      ),
    );
  }

  async function hitRateLimit() {
    setError(null);
    const res = await fetch('/api/rate-limit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bucket: 'redis-lab', limit: 5, windowSeconds: 15 }),
    });
    const data = await res.json();
    if (res.status === 503) {
      setLive(false);
      setError((data as { setup?: string }).setup ?? 'Redis required');
      return;
    }
    setLive(true);
    setResult(JSON.stringify(data, null, 2));
  }

  return (
    <DemoShell
      title="Redis cache lab"
      description="Set/get with TTL and distributed rate limits via Upstash Redis on the Vercel Marketplace."
      example={redisSnippet()}
      onReset={() => {
        setKey('greeting');
        setValue('hello from upstash');
        setTtl(60);
        setResult('-');
        setError(null);
      }}
    >
      {live ? (
        <DemoStatus tone="success">Talking to Upstash Redis REST.</DemoStatus>
      ) : (
        <DemoStatus tone="warning">
          Provision Redis with the Deploy button (Upstash) or set UPSTASH_REDIS_REST_URL /
          UPSTASH_REDIS_REST_TOKEN.
        </DemoStatus>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Key">
            <Input className="font-mono text-xs" value={key} onChange={(e) => setKey(e.target.value)} />
          </Field>
          <Field label="Value">
            <Input className="text-xs" value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
          <Field label="TTL (seconds)">
            <Input
              type="number"
              className="font-mono text-xs"
              value={ttl}
              onChange={(e) => setTtl(Number(e.target.value) || 1)}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={setCache}>
              Set
            </Button>
            <Button type="button" variant="outline" onClick={getCache}>
              Get
            </Button>
            <Button type="button" variant="secondary" onClick={hitRateLimit}>
              Hit rate limit
            </Button>
          </div>
          {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        </div>
        <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">{result}</pre>
      </div>
    </DemoShell>
  );
}
