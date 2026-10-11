'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_PROMPT, type ToolTraceEntry } from './logic';

export default function ToolCallingWeatherDemo() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [answer, setAnswer] = useState('');
  const [trace, setTrace] = useState<ToolTraceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setAnswer('');
    setTrace([]);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Chat failed.');
        return;
      }
      setAnswer(String(data.text ?? ''));
      setTrace(Array.isArray(data.toolTrace) ? data.toolTrace : []);
      setProvider(typeof data.provider === 'string' ? data.provider : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Tool-calling weather demo"
      description="Chat with mock weather, time, and calculator tools — plus a visible tool-call trace."
      onReset={() => {
        setPrompt(SAMPLE_PROMPT);
        setAnswer('');
        setTrace([]);
        setError(null);
        setProvider(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Prompt" htmlFor="prompt">
          <Textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-24 text-sm" />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Calling tools…' : 'Ask with tools'}
        </Button>
        {provider ? <DemoStatus tone="success">Provider: {provider}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {answer ? (
          <pre className="whitespace-pre-wrap rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm">{answer}</pre>
        ) : null}
        {trace.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">Tool trace</h3>
            {trace.map((t, i) => (
              <pre key={i} className="overflow-auto rounded-md border border-fd-border p-3 text-xs">
{JSON.stringify(t, null, 2)}
              </pre>
            ))}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
