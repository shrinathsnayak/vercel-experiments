'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { CopyButton } from './ui/copy-button';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { cn } from './ui/utils';
import { createMockCapture } from './logic';

type CapturedRequest = {
  id: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: string | null;
  bodyTruncated: boolean;
  receivedAt: number;
};

export default function WebhookPlaygroundDemo() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [requests, setRequests] = useState<CapturedRequest[]>([]);
  const [mockMode, setMockMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [backend, setBackend] = useState<'redis' | 'memory' | null>(null);

  const refresh = useCallback(async (id: string) => {
    if (mockMode) return;
    const res = await fetch(`/api/webhooks/${id}`);
    if (!res.ok) {
      setError('Session expired or unavailable.');
      return;
    }
    const data = (await res.json()) as { requests: CapturedRequest[] };
    setRequests(data.requests);
  }, [mockMode]);

  async function createSession() {
    setLoading(true);
    setError(null);
    try {
      if (mockMode) {
        const id = crypto.randomUUID();
        setSessionId(id);
        setEndpoint(`${window.location.origin}/api/webhooks/${id}`);
        setRequests([]);
        setAnnouncement('Mock session created.');
        return;
      }
      const res = await fetch('/api/webhooks/session', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create session');
      const data = (await res.json()) as {
        sessionId: string;
        endpoint: string;
        backend?: 'redis' | 'memory';
      };
      setSessionId(data.sessionId);
      setEndpoint(data.endpoint);
      setBackend(data.backend ?? 'memory');
      setRequests([]);
      setAnnouncement(
        data.backend === 'redis'
          ? 'Webhook session created (Redis-backed).'
          : 'Webhook session created (in-memory - add Upstash for durability).',
      );
    } catch {
      setError('Could not create session.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionId || mockMode) return;
    const timer = window.setInterval(() => refresh(sessionId), 3000);
    return () => window.clearInterval(timer);
  }, [sessionId, mockMode, refresh]);

  async function sendSampleWebhook() {
    if (!sessionId || !endpoint) return;
    const payload = JSON.stringify({ event: 'ping', at: new Date().toISOString() }, null, 2);
    if (mockMode) {
      const mock = createMockCapture({
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer secret-token' },
        body: payload,
      });
      setRequests((prev) => [mock, ...prev]);
      setAnnouncement('Mock request captured locally.');
      return;
    }
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
    });
    await refresh(sessionId);
    setAnnouncement('Sample webhook sent.');
  }

  async function replay(requestId: string) {
    if (!sessionId) return;
    if (mockMode) {
      const req = requests.find((r) => r.id === requestId);
      if (req) {
        setAnnouncement(`Replay (mock): ${req.method} with stored body.`);
      }
      return;
    }
    const replayRes = await fetch(`/api/webhooks/${sessionId}/replay`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    if (!replayRes.ok) {
      setError('Replay failed.');
      return;
    }
    const data = (await replayRes.json()) as {
      replay: { method: string; headers: Record<string, string>; body: string | null };
    };
    await fetch(endpoint!, {
      method: data.replay.method,
      headers: { 'content-type': 'application/json' },
      body: data.replay.body ?? undefined,
    });
    await refresh(sessionId);
    setAnnouncement('Request replayed to endpoint.');
  }

  const selected = requests.find((r) => r.id === selectedId) ?? requests[0];

  return (
    <DemoShell
      title="Webhook playground"
      description="Capture inbound HTTP requests with redacted secrets. Sessions expire after 30 minutes."
      announcement={announcement}
      onReset={() => {
        setSessionId(null);
        setEndpoint(null);
        setRequests([]);
        setError(null);
        setSelectedId(null);
      }}
      toolbar={
        <label className="inline-flex items-center gap-2 text-xs">
          <Checkbox checked={mockMode} onCheckedChange={(c) => setMockMode(c === true)} />
          <Label className="text-xs font-normal">Mock local mode</Label>
        </label>
      }
    >
      <div className="space-y-4">
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {!sessionId ? (
          <Button type="button" variant="outline" size="sm" disabled={loading} onClick={createSession}>
            {loading ? 'Creating…' : 'Create webhook session'}
          </Button>
        ) : (
          <>
            <DemoStatus tone={backend === 'redis' ? 'success' : 'neutral'}>
              {mockMode
                ? 'Mock mode: captures stay in the browser and never hit the server store.'
                : backend === 'redis'
                  ? 'Live mode with Upstash Redis session store.'
                  : 'Live mode (in-memory store). Deploy with Redis for multi-instance durability.'}
            </DemoStatus>
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-fd-border bg-fd-muted/30 p-3">
              <code className="min-w-0 flex-1 break-all text-xs">{endpoint}</code>
              {endpoint ? <CopyButton value={endpoint} label="Copy URL" /> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={sendSampleWebhook}>
                Send sample POST
              </Button>
              {!mockMode && sessionId ? (
                <Button type="button" variant="outline" size="sm" onClick={() => refresh(sessionId)}>
                  Refresh list
                </Button>
              ) : null}
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
                  Captured requests ({requests.length})
                </h3>
                <ul className="max-h-80 space-y-1 overflow-y-auto rounded-md border border-fd-border">
                  {requests.length === 0 ? (
                    <li className="p-3 text-xs text-fd-muted-foreground">No requests yet.</li>
                  ) : (
                    requests.map((req) => (
                      <li key={req.id}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedId(req.id)}
                          className={cn(
                            'h-auto w-full justify-between gap-2 px-3 py-2 text-left text-xs font-normal',
                            selected?.id === req.id && 'bg-fd-accent/60',
                          )}
                        >
                          <span className="font-mono font-medium">{req.method}</span>
                          <span className="text-fd-muted-foreground">
                            {new Date(req.receivedAt).toLocaleTimeString()}
                          </span>
                        </Button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              {selected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
                      Request detail
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => replay(selected.id)}
                    >
                      Replay
                    </Button>
                  </div>
                  <pre className="max-h-96 overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
                    {JSON.stringify(selected, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </DemoShell>
  );
}
