'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { SAMPLE_PROMPT, type ChatMessage } from './logic';

export default function MemoryThreadLabDemo() {
  const [message, setMessage] = useState(SAMPLE_PROMPT);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ttlLabel, setTtlLabel] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message, threadId: threadId ?? undefined }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Chat failed.');
        return;
      }
      setThreadId(data.thread.id as string);
      setMessages(data.thread.messages as ChatMessage[]);
      setTtlLabel(typeof data.ttl?.label === 'string' ? data.ttl.label : null);
      setNote(typeof data.note === 'string' ? data.note : null);
      setMessage('');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  async function clearThread() {
    if (!threadId) return;
    await fetch(`/api/thread?id=${encodeURIComponent(threadId)}`, { method: 'DELETE' });
    setThreadId(null);
    setMessages([]);
    setTtlLabel(null);
  }

  return (
    <DemoShell
      title="Memory thread lab"
      description="Multi-turn chat with Redis thread memory + TTL visualization (memory fallback)."
      onReset={() => {
        setMessage(SAMPLE_PROMPT);
        setThreadId(null);
        setMessages([]);
        setError(null);
        setTtlLabel(null);
      }}
    >
      <div className="space-y-4">
        {ttlLabel ? <DemoStatus tone="warning">{ttlLabel}</DemoStatus> : null}
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={`${m.at}-${i}`}
              className="rounded-md border border-fd-border px-3 py-2 text-sm"
            >
              <p className="text-[10px] uppercase tracking-wide text-fd-muted-foreground">
                {m.role}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}
        </div>
        <Field label="Message" htmlFor="msg">
          <Input id="msg" value={message} onChange={(e) => setMessage(e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={send}>
            {loading ? 'Sending…' : 'Send'}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!threadId} onClick={clearThread}>
            Clear thread
          </Button>
        </div>
        {threadId ? (
          <p className="text-xs text-fd-muted-foreground font-mono">thread: {threadId}</p>
        ) : null}
      </div>
    </DemoShell>
  );
}
