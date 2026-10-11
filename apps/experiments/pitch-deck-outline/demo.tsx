'use client';
import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_IDEA } from './logic';

export default function Demo() {
  const [input, setInput] = useState(SAMPLE_IDEA);
  const [partial, setPartial] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setPartial(null);
    try {
      const res = await fetch('/api/outline', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idea: input }),
      });
      if (res.status === 503) {
        const data = await res.json();
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok || !res.body) { setError('Request failed.'); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try { setPartial(JSON.parse(line)); } catch { /* ignore partial json */ }
        }
      }
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Pitch Deck Outline" description="Idea - streamed slide outline via streamObject." onReset={() => { setInput(SAMPLE_IDEA); setPartial(null); setError(null); }}>
      <div className="space-y-4">
        <Field label="Idea" htmlFor="in"><Textarea id="in" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-28 text-sm" /></Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>{loading ? 'Streaming…' : 'Stream outline'}</Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {partial ? <pre className="overflow-x-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">{JSON.stringify(partial, null, 2)}</pre> : null}
      </div>
    </DemoShell>
  );
}
