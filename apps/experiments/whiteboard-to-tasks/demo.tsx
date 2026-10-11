'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import type { BoardTask } from './logic';

export default function WhiteboardToTasksDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!file) { setError('Choose an image first.'); return; }
    setLoading(true); setError(null); setTasks([]);
    try {
      const form = new FormData(); form.set('file', file);
      const res = await fetch('/api/tasks', { method: 'POST', body: form });
      const data = await res.json();
      if (res.status === 503) { setError(`${data.error}. ${data.setup}`); return; }
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setTasks(data.tasks as BoardTask[]);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Whiteboard to tasks" description="Image - tasks JSON via vision generateObject."
      onReset={() => { setFile(null); setTasks([]); setError(null); }}>
      <div className="space-y-4">
        <Field label="Whiteboard photo" htmlFor="img">
          <Input id="img" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Extracting…' : 'Extract tasks'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <ul className="space-y-2">
          {tasks.map((t, i) => (
            <li key={i} className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm">
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-fd-muted-foreground">
                {t.priority}{t.owner ? ` · ${t.owner}` : ''}{t.dueHint ? ` · ${t.dueHint}` : ''}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}
