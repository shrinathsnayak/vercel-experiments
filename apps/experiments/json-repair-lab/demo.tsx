'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_BROKEN, type DiffLine } from './logic';

export default function JsonRepairLabDemo() {
  const [input, setInput] = useState(SAMPLE_BROKEN);
  const [repaired, setRepaired] = useState('');
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function repair() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/repair', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ json: input }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Repair failed.');
        return;
      }
      setRepaired(String(data.repaired ?? ''));
      setDiff(Array.isArray(data.diff) ? data.diff : []);
      setNotes(Array.isArray(data.notes) ? data.notes : []);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="JSON repair lab"
      description="Paste broken JSON - heuristic (and optional AI) repair with a line diff."
      onReset={() => {
        setInput(SAMPLE_BROKEN);
        setRepaired('');
        setDiff([]);
        setNotes([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Broken JSON" htmlFor="json">
          <Textarea id="json" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-40 font-mono text-xs" />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={repair}>
          {loading ? 'Repairing…' : 'Repair'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {notes.length > 0 ? <DemoStatus tone="warning">{notes.join(' · ')}</DemoStatus> : null}
        {repaired ? (
          <pre className="overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 font-mono text-xs">{repaired}</pre>
        ) : null}
        {diff.length > 0 ? (
          <pre className="overflow-auto rounded-md border border-fd-border p-3 font-mono text-xs">
            {diff
              .map((d) => `${d.kind === 'add' ? '+' : d.kind === 'del' ? '-' : ' '} ${d.text}`)
              .join('\n')}
          </pre>
        ) : null}
      </div>
    </DemoShell>
  );
}
