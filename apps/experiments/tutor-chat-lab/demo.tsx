'use client';
import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SAMPLE_TOPIC, type ChatMessage } from './logic';

export default function Demo() {
  const [topic, setTopic] = useState(SAMPLE_TOPIC);
  const [input, setInput] = useState('Explain the key idea simply.');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const next: ChatMessage = { role: 'user', content: input.trim() };
    if (!next.content) return;
    const history = [...messages, next];
    setMessages(history);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic, messages: history }),
      });
      if (res.status === 503) {
        const data = await res.json();
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok || !res.body) { setError('Request failed.'); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistant = '';
      setMessages([...history, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value, { stream: true });
        setMessages([...history, { role: 'assistant', content: assistant }]);
      }
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <DemoShell title="Tutor Chat Lab" description="Streamed tutoring chat grounded in a topic you set; uses AI SDK streamText with honest 503 when no provider." onReset={() => { setTopic(SAMPLE_TOPIC); setMessages([]); setError(null); }}>
      <div className="space-y-4">
        
        <Field label="Topic" htmlFor="topic"><Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} /></Field>
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-fd-border p-3 text-sm">
          {messages.length === 0 ? <p className="text-fd-muted-foreground">Ask a question.</p> : messages.map((m, i) => (
            <p key={i}><span className="font-medium">{m.role}:</span> {m.content}</p>
          ))}
        </div>
        <Field label="Message" htmlFor="msg"><Textarea id="msg" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-20 text-sm" /></Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={send}>{loading ? 'Streaming…' : 'Ask tutor'}</Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
      </div>
    </DemoShell>
  );
}
