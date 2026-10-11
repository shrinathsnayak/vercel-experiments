'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { REDACTION_CAVEAT, SAMPLE_TEXT, type PiiSpan } from './logic';

export default function PdfRedactionHelperDemo() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [spans, setSpans] = useState<PiiSpan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caveat, setCaveat] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setSpans([]);
    try {
      const res = await fetch('/api/redact', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setSpans(data.spans as PiiSpan[]);
      setCaveat(typeof data.caveat === 'string' ? data.caveat : REDACTION_CAVEAT);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="PDF redaction helper" description="Text - PII span suggestions (not perfect redaction)."
      onReset={() => { setText(SAMPLE_TEXT); setSpans([]); setError(null); setCaveat(null); }}>
      <div className="space-y-4">
        <DemoStatus tone="warning">{REDACTION_CAVEAT}</DemoStatus>
        <Field label="Document text" htmlFor="text">
          <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} className="min-h-32 text-sm" />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Scanning…' : 'Suggest PII spans'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {caveat ? <DemoStatus tone="warning">{caveat}</DemoStatus> : null}
        <ul className="space-y-2">
          {spans.map((s, i) => (
            <li key={i} className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm">
              <span className="text-xs uppercase text-fd-muted-foreground">{s.type}</span>
              <p className="font-mono text-xs">{s.text}</p>
              <p className="text-xs text-fd-muted-foreground">[{s.start}, {s.end})</p>
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}
