'use client';

import { useRef, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { cn } from './ui/utils';

type Mode = 'stream' | 'structured' | 'tools';

export default function AiStreamingLabDemo() {
  const [prompt, setPrompt] = useState('Explain streaming SSR in two short paragraphs.');
  const [mode, setMode] = useState<Mode>('stream');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setOutput('');
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode, prompt }),
        signal: controller.signal,
      });

      if (res.status === 503) {
        const data = (await res.json()) as { error: string; setup: string };
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError('Request failed.');
        return;
      }

      if (mode === 'structured') {
        const data = await res.json();
        setOutput(JSON.stringify(data, null, 2));
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
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setOutput((prev) => `${prev}\n\n- Cancelled -`);
      } else {
        setError('Network error.');
      }
    } finally {
      setLoading(false);
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setLoading(false);
  }

  return (
    <DemoShell
      title="AI streaming lab"
      description="AI Gateway (preferred) or OpenAI via the AI SDK - never fabricates responses."
      onReset={() => {
        setOutput('');
        setError(null);
        setPrompt('Explain streaming SSR in two short paragraphs.');
        setMode('stream');
      }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Response mode">
          {(['stream', 'structured', 'tools'] as Mode[]).map((m) => (
            <Button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              variant={mode === m ? 'secondary' : 'outline'}
              size="sm"
              className={cn('capitalize', mode !== m && 'hover:bg-fd-accent/50')}
              onClick={() => setMode(m)}
            >
              {m === 'tools' ? 'Tool calling' : m}
            </Button>
          ))}
        </div>
        <Field label="Prompt" htmlFor="ai-prompt">
          <Textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-24 text-sm"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
            {loading ? 'Running…' : 'Run'}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!loading} onClick={cancel}>
            Cancel
          </Button>
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <pre
          className="min-h-40 overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs leading-relaxed"
          aria-live="polite"
        >
          {output || (loading ? 'Waiting for tokens…' : 'Output will appear here.')}
        </pre>
      </div>
    </DemoShell>
  );
}
