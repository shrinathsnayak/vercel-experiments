'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SAMPLE_BRIEF, type ProposedEmail } from './logic';

export default function HumanInTheLoopLabDemo() {
  const [brief, setBrief] = useState(SAMPLE_BRIEF);
  const [email, setEmail] = useState<ProposedEmail | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function propose() {
    setLoading(true);
    setError(null);
    setWebhookStatus(null);
    try {
      const res = await fetch('/api/propose', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Propose failed.');
        return;
      }
      setEmail(data.email as ProposedEmail);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, webhookUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Send failed.');
        return;
      }
      setWebhookStatus(String(data.webhookStatus ?? 'unknown'));
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Human-in-the-loop lab"
      description="AI proposes an email draft; you edit it, then POST the approved payload to a webhook."
      onReset={() => {
        setBrief(SAMPLE_BRIEF);
        setEmail(null);
        setWebhookStatus(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Brief" htmlFor="brief">
          <Textarea id="brief" value={brief} onChange={(e) => setBrief(e.target.value)} className="min-h-24 text-sm" />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={propose}>
          {loading && !email ? 'Drafting…' : 'Propose email'}
        </Button>
        {email ? (
          <div className="space-y-3 rounded-md border border-fd-border p-3">
            <Field label="To" htmlFor="to">
              <Input id="to" value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })} />
            </Field>
            <Field label="Subject" htmlFor="subject">
              <Input
                id="subject"
                value={email.subject}
                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
              />
            </Field>
            <Field label="Body" htmlFor="body">
              <Textarea
                id="body"
                value={email.body}
                onChange={(e) => setEmail({ ...email, body: e.target.value })}
                className="min-h-32 text-sm"
              />
            </Field>
            <Field label="Webhook URL" htmlFor="hook">
              <Input id="hook" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="font-mono text-xs" />
            </Field>
            <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={send}>
              Approve & POST webhook
            </Button>
          </div>
        ) : null}
        {webhookStatus ? <DemoStatus tone="success">Webhook status: {webhookStatus}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
      </div>
    </DemoShell>
  );
}
