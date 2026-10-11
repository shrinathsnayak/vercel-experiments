'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import {
  SAMPLE_TOPIC,
  type Bucket,
  type FunnelStats,
  type Headlines,
} from './logic';

export default function AbLandingCopyLabDemo() {
  const [topic, setTopic] = useState(SAMPLE_TOPIC);
  const [headlines, setHeadlines] = useState<Headlines | null>(null);
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const [headline, setHeadline] = useState<string | null>(null);
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [rates, setRates] = useState<{ A: number; B: number } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Generate failed.');
        return;
      }
      setHeadlines(data.headlines as Headlines);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  async function assign() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assign');
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Assign failed.');
        return;
      }
      const b = data.bucket as Bucket;
      setBucket(b);
      setHeadline(data.headline as string);
      setHeadlines(data.headlines as Headlines);
      await fetch('/api/event', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bucket: b, type: 'impression' }),
      });
      await refreshStats();
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  async function convert() {
    if (!bucket) return;
    await fetch('/api/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bucket, type: 'conversion' }),
    });
    await refreshStats();
  }

  async function refreshStats() {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (res.ok) {
      setStats(data.stats as FunnelStats);
      setRates(data.rates as { A: number; B: number });
    }
  }

  return (
    <DemoShell
      title="A/B landing copy lab"
      description="AI generates two headlines, cookie buckets visitors, Redis/memory tracks impressions and conversions."
      onReset={() => {
        setTopic(SAMPLE_TOPIC);
        setHeadlines(null);
        setBucket(null);
        setHeadline(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Product topic" htmlFor="topic">
          <Textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-20 text-sm"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={generate}>
            Generate headlines
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={loading} onClick={assign}>
            Assign bucket
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!bucket} onClick={convert}>
            Record conversion
          </Button>
        </div>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {headline && bucket ? (
          <div className="rounded-md border border-fd-border bg-fd-secondary/40 p-4">
            <p className="text-xs uppercase tracking-wide text-fd-muted-foreground">
              Bucket {bucket}
            </p>
            <p className="mt-1 text-lg font-medium">{headline}</p>
          </div>
        ) : null}
        {headlines ? (
          <p className="text-xs text-fd-muted-foreground">
            A: {headlines.A} · B: {headlines.B}
          </p>
        ) : null}
        {stats && rates ? (
          <p className="text-sm text-fd-muted-foreground">
            Imp A/B: {stats.impressions.A}/{stats.impressions.B} · Conv A/B:{' '}
            {stats.conversions.A}/{stats.conversions.B} · Rate A {(rates.A * 100).toFixed(0)}% · B{' '}
            {(rates.B * 100).toFixed(0)}%
          </p>
        ) : null}
      </div>
    </DemoShell>
  );
}
