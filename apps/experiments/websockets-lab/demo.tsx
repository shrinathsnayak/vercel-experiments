'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { REALTIME_OPTIONS, wsSnippet } from './logic';

export default function WebsocketsLabDemo() {
  const [events, setEvents] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  function startSse() {
    setEvents([]);
    setRunning(true);
    const es = new EventSource('/api/sse');
    const push = (label: string, data: MessageEvent) => {
      setEvents((prev) => [...prev, `${label}: ${data.data}`].slice(-20));
    };
    es.addEventListener('hello', (e) => push('hello', e as MessageEvent));
    es.addEventListener('tick', (e) => push('tick', e as MessageEvent));
    es.addEventListener('done', (e) => {
      push('done', e as MessageEvent);
      es.close();
      setRunning(false);
    });
    es.onerror = () => {
      es.close();
      setRunning(false);
      setEvents((prev) => [...prev, 'error: stream closed']);
    };
  }

  return (
    <DemoShell
      title="WebSockets / realtime lab"
      description="Documents Vercel/Fluid realtime constraints with an honest SSE playground vs full WebSockets."
      example={wsSnippet()}
      onReset={() => {
        setEvents([]);
        setRunning(false);
      }}
    >
      <DemoStatus tone="warning">
        This playground uses Server-Sent Events (one-way), not WebSockets. Long-lived WS generally needs an external
        realtime service when your app runs on Vercel.
      </DemoStatus>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Button type="button" disabled={running} onClick={startSse}>
            {running ? 'Streaming…' : 'Start SSE stream'}
          </Button>
          <pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
            {events.length ? events.join('\n') : 'Events will appear here.'}
          </pre>
        </div>
        <ul className="space-y-2 text-sm">
          {REALTIME_OPTIONS.map((opt) => (
            <li key={opt.id} className="rounded border p-3">
              <p className="font-medium">{opt.title}</p>
              <p className="text-xs text-muted-foreground">
                Fluid-friendly: {opt.worksOnVercelFluid ? 'yes / common' : 'no / not a general WS host'}
              </p>
              <p className="mt-1 text-xs">{opt.notes}</p>
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}
