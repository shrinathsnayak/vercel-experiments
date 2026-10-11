'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_NOTES, type ActionItem } from './logic';

export default function NotesToActionsLabDemo() {
  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [storageNote, setStorageNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/actions');
      const data = await res.json();
      if (res.ok) {
        setActions(data.actions as ActionItem[]);
        setStorageNote(typeof data.note === 'string' ? data.note : null);
      }
    } catch {
      /* ignore initial load errors */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      setActions(data.actions as ActionItem[]);
      setStorageNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  async function toggle(item: ActionItem) {
    const next = item.status === 'open' ? 'done' : 'open';
    setActions((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, status: next } : a)),
    );
    try {
      const res = await fetch('/api/actions', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: next }),
      });
      if (!res.ok) {
        setActions((prev) =>
          prev.map((a) => (a.id === item.id ? item : a)),
        );
      }
    } catch {
      setActions((prev) =>
        prev.map((a) => (a.id === item.id ? item : a)),
      );
    }
  }

  return (
    <DemoShell
      title="Notes to actions lab"
      description="Paste meeting notes - generateObject action items. Persists to Neon when DATABASE_URL is set."
      onReset={() => {
        setNotes(SAMPLE_NOTES);
        setActions([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Meeting notes" htmlFor="notes">
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-28 text-sm"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={generate}>
          {loading ? 'Extracting…' : 'Extract actions'}
        </Button>
        {storageNote ? <DemoStatus tone="warning">{storageNote}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <ul className="space-y-2">
          {actions.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm"
            >
              <div>
                <p className={item.status === 'done' ? 'line-through text-fd-muted-foreground' : ''}>
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-fd-muted-foreground">
                  {[item.owner && `Owner: ${item.owner}`, item.due && `Due: ${item.due}`]
                    .filter(Boolean)
                    .join(' · ') || 'No owner/due'}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => toggle(item)}>
                {item.status === 'open' ? 'Mark done' : 'Reopen'}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}
