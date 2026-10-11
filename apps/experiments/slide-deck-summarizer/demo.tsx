'use client';

import { useRef, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SAMPLE_DECK } from './logic';

export default function SlideDeckSummarizerDemo() {
  const [text, setText] = useState(SAMPLE_DECK);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setSummary('');
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const form = new FormData();
      form.set('text', text);
      if (file) form.set('file', file);
      const res = await fetch('/api/summarize', {
        method: 'POST',
        body: form,
        signal: controller.signal,
      });

      if (res.status === 503) {
        const data = await res.json();
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError('No response stream.');
        return;
      }
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setSummary((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setSummary((prev) => `${prev}\n\n- Cancelled -`);
      } else {
        setError('Network error.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Slide deck summarizer"
      description="Paste or upload a PDF/text deck - streamText per-slide bullets and an executive brief."
      onReset={() => {
        setText(SAMPLE_DECK);
        setFile(null);
        setSummary('');
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Deck text" htmlFor="deck">
          <Textarea
            id="deck"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-28 font-mono text-xs"
          />
        </Field>
        <Field label="Optional PDF / text file" htmlFor="file">
          <Input
            id="file"
            type="file"
            accept=".txt,.md,.pdf,application/pdf,text/plain,text/markdown"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
            {loading ? 'Summarizing…' : 'Summarize deck'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!loading}
            onClick={() => abortRef.current?.abort()}
          >
            Cancel
          </Button>
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <pre className="min-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs leading-relaxed">
          {summary || (loading ? 'Waiting for tokens…' : 'Summary stream will appear here.')}
        </pre>
      </div>
    </DemoShell>
  );
}
