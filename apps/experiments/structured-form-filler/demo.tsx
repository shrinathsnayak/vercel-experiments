'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_PROSE, type FormField } from './logic';

export default function StructuredFormFillerDemo() {
  const [prose, setProse] = useState(SAMPLE_PROSE);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fill() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fill', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prose }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Fill failed.');
        return;
      }
      setFields(Array.isArray(data.fields) ? data.fields : []);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Structured form filler"
      description="Paste prose - fill Zod form fields with per-field confidence scores."
      onReset={() => {
        setProse(SAMPLE_PROSE);
        setFields([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Prose" htmlFor="prose">
          <Textarea id="prose" value={prose} onChange={(e) => setProse(e.target.value)} className="min-h-28 text-sm" />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={fill}>
          {loading ? 'Filling…' : 'Fill form'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {fields.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-fd-muted-foreground">
                <th className="py-1">Field</th>
                <th>Value</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <tr key={f.key} className="border-t border-fd-border">
                  <td className="py-2 pr-2">{f.label}</td>
                  <td className="pr-2 font-mono text-xs">{f.value || '—'}</td>
                  <td>{Math.round(f.confidence * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </DemoShell>
  );
}
