'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_PAYLOAD, type SheetRow } from './logic';

export default function WebhookToSheetLabDemo() {
  const [payload, setPayload] = useState(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/rows');
    const data = await res.json();
    if (res.ok) { setRows(data.rows as SheetRow[]); setNote(typeof data.note === 'string' ? data.note : null); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function send() {
    setError(null);
    let parsed: unknown;
    try { parsed = JSON.parse(payload); } catch { setError('Invalid JSON'); return; }
    const res = await fetch('/api/hook', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(parsed),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed'); return; }
    setRows(data.rows as SheetRow[]);
    setNote(typeof data.note === 'string' ? data.note : null);
  }

  async function replay() {
    const res = await fetch('/api/replay', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Replay failed'); return; }
    setRows(data.rows as SheetRow[]);
    setNote(typeof data.note === 'string' ? data.note : 'Replayed last payload.');
  }

  return (
    <DemoShell title="Webhook to sheet lab" description="Webhook receive - sheet rows + replay."
      onReset={() => { setPayload(JSON.stringify(SAMPLE_PAYLOAD, null, 2)); setError(null); }}>
      <div className="space-y-4">
        <Field label="Webhook JSON" htmlFor="payload">
          <Textarea id="payload" value={payload} onChange={(e) => setPayload(e.target.value)} className="min-h-28 font-mono text-xs" />
        </Field>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={send}>Receive webhook</Button>
          <Button type="button" variant="outline" size="sm" onClick={replay}>Replay last</Button>
        </div>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse">
            <thead><tr className="text-left text-fd-muted-foreground"><th className="p-2">id</th><th className="p-2">columns</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-fd-border">
                  <td className="p-2 font-mono">{r.id}</td>
                  <td className="p-2 font-mono">{JSON.stringify(r.columns)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DemoShell>
  );
}
