'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_INPUT, type AuditEntry } from './logic';

export default function GuardrailsLabDemo() {
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [action, setAction] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setError(typeof data.error === 'string' ? data.error : 'Rate limited.');
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Check failed.');
        return;
      }
      setAction(String(data.action ?? ''));
      setReason(String(data.reason ?? ''));
      setOutput(String(data.output ?? ''));
      setAudit(Array.isArray(data.audit) ? data.audit : []);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Guardrails lab"
      description="Allow / block / rewrite policy with an audit log. Optional Redis rate limit."
      onReset={() => {
        setInput(SAMPLE_INPUT);
        setAction(null);
        setReason(null);
        setOutput('');
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="User input" htmlFor="input">
          <Textarea id="input" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-24 text-sm" />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={check}>
          {loading ? 'Checking…' : 'Run policy'}
        </Button>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {action ? (
          <DemoStatus tone={action === 'block' ? 'error' : action === 'rewrite' ? 'warning' : 'success'}>
            {action}: {reason}
          </DemoStatus>
        ) : null}
        {output ? <pre className="whitespace-pre-wrap rounded-md border border-fd-border p-3 text-sm">{output}</pre> : null}
        {audit.length > 0 ? (
          <pre className="max-h-48 overflow-auto rounded-md border border-fd-border p-3 font-mono text-xs">
{JSON.stringify(audit.slice(0, 8), null, 2)}
          </pre>
        ) : null}
      </div>
    </DemoShell>
  );
}
