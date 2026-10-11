'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SAMPLE_LEAD, type Lead } from './logic';

export default function FormToCrmLabDemo() {
  const [name, setName] = useState(SAMPLE_LEAD.name);
  const [email, setEmail] = useState(SAMPLE_LEAD.email);
  const [company, setCompany] = useState(SAMPLE_LEAD.company ?? '');
  const [message, setMessage] = useState(SAMPLE_LEAD.message ?? '');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (res.ok) {
        setLeads(data.leads as Lead[]);
        setNote(typeof data.note === 'string' ? data.note : null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, company, message, webhookUrl: webhookUrl || undefined }),
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
      setLeads(data.leads as Lead[]);
      setNote(typeof data.note === 'string' ? data.note : null);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Form to CRM lab"
      description="Lead form - Zod validate - AI enrich (companyGuess, urgency) - Neon or memory - optional webhook."
      onReset={() => {
        setName(SAMPLE_LEAD.name);
        setEmail(SAMPLE_LEAD.email);
        setCompany('');
        setMessage(SAMPLE_LEAD.message ?? '');
        setWebhookUrl('');
        setError(null);
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>
        <Field label="Company (optional)" htmlFor="company">
          <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
        </Field>
        <Field label="Message" htmlFor="message">
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-24 text-sm"
          />
        </Field>
        <Field label="Outbound webhook URL (optional)" htmlFor="webhook">
          <Input
            id="webhook"
            placeholder="https://example.com/hooks/leads"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={submit}>
          {loading ? 'Saving…' : 'Submit lead'}
        </Button>
        {note ? <DemoStatus tone="warning">{note}</DemoStatus> : null}
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <ul className="space-y-2">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm"
            >
              <p className="font-medium">
                {lead.name} · {lead.email}
              </p>
              <p className="mt-1 text-xs text-fd-muted-foreground">
                Guess: {lead.companyGuess} · Urgency: {lead.urgency}
                {lead.webhookStatus ? ` · Webhook: ${lead.webhookStatus}` : ''}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}
