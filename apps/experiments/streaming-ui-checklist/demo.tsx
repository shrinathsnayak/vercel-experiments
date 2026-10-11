'use client';

import { useRef, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import {
  mergePartialChecklist,
  SAMPLE_PROMPT,
  type ChecklistItem,
} from './logic';

export default function StreamingUiChecklistDemo() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setItems([]);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt }),
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
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const partial = JSON.parse(line) as {
              items?: Array<{ title?: string; detail?: string }>;
            };
            setItems(mergePartialChecklist(partial));
          } catch {
            /* wait for a complete NDJSON line */
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Cancelled.');
      } else {
        setError('Network error.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Streaming UI checklist"
      description="Prompt - streamObject checklist items that appear as the partial object grows."
      onReset={() => {
        setPrompt(SAMPLE_PROMPT);
        setItems([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Prompt" htmlFor="prompt">
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-24 text-sm"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
            {loading ? 'Streaming…' : 'Stream checklist'}
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
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {items.map((item, i) => (
            <li key={`${i}-${item.title}`}>
              <span className="font-medium">{item.title}</span>
              {item.detail ? (
                <span className="text-fd-muted-foreground"> - {item.detail}</span>
              ) : null}
            </li>
          ))}
        </ol>
        {loading && items.length === 0 ? (
          <p className="text-xs text-fd-muted-foreground">Waiting for partial object…</p>
        ) : null}
      </div>
    </DemoShell>
  );
}
