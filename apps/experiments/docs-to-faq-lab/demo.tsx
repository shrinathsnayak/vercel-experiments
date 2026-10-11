'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_DOCS, type FaqPair } from './logic';

export default function DocsToFaqLabDemo() {
  const [markdown, setMarkdown] = useState(SAMPLE_DOCS);
  const [faqs, setFaqs] = useState<FaqPair[]>([]);
  const [meta, setMeta] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setFaqs([]);
    setMeta(null);
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ markdown }),
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
      setFaqs(data.faqs as FaqPair[]);
      const bits = [
        data.cached ? 'cache hit' : 'cache miss',
        `backend: ${data.cache}`,
        data.note,
      ].filter(Boolean);
      setMeta(bits.join(' · '));
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Docs to FAQ lab"
      description="Paste markdown docs - FAQ pairs. Redis caches by content hash when configured."
      onReset={() => {
        setMarkdown(SAMPLE_DOCS);
        setFaqs([]);
        setMeta(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Markdown docs" htmlFor="docs">
          <Textarea
            id="docs"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-36 font-mono text-xs"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Generating…' : 'Generate FAQ'}
        </Button>
        {meta ? <DemoStatus>{meta}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-md border border-fd-border p-3 text-sm">
              <p className="font-medium">{faq.question}</p>
              <p className="mt-1 text-fd-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
