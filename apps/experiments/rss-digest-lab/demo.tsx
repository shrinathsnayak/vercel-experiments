'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { DEFAULT_TOP_N, SAMPLE_FEED, type DigestItem } from './logic';

export default function RssDigestLabDemo() {
  const [feedUrl, setFeedUrl] = useState(SAMPLE_FEED);
  const [topN, setTopN] = useState(String(DEFAULT_TOP_N));
  const [digests, setDigests] = useState<DigestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(regenerate = false) {
    setLoading(true);
    setError(null);
    if (!regenerate) setDigests([]);
    try {
      const res = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          feedUrl,
          topN: Number(topN) || DEFAULT_TOP_N,
          regenerate,
        }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      setDigests(data.digests as DigestItem[]);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="RSS digest lab"
      description="Fetch an RSS/Atom feed, take top-N items, and generateObject short digests. Regenerate refreshes wording."
      onReset={() => {
        setFeedUrl(SAMPLE_FEED);
        setTopN(String(DEFAULT_TOP_N));
        setDigests([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Feed URL" htmlFor="feed-url">
          <Input
            id="feed-url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            className="font-mono text-xs"
          />
        </Field>
        <Field label="Top N" htmlFor="top-n">
          <Input
            id="top-n"
            type="number"
            min={1}
            max={10}
            value={topN}
            onChange={(e) => setTopN(e.target.value)}
            className="w-24"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => run(false)}
          >
            {loading ? 'Digesting…' : 'Digest feed'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || digests.length === 0}
            onClick={() => run(true)}
          >
            Regenerate
          </Button>
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {digests.length ? (
          <ul className="space-y-3 text-sm" aria-live="polite">
            {digests.map((item, i) => (
              <li key={i} className="rounded-md border border-fd-border p-3">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-fd-muted-foreground">{item.digest}</p>
                {item.link ? (
                  <a
                    href={item.link}
                    className="mt-1 inline-block font-mono text-xs underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.link}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </DemoShell>
  );
}
