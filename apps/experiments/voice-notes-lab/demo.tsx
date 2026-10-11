'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_TRANSCRIPT, type VoiceActions } from './logic';

export default function VoiceNotesLabDemo() {
  const [transcript, setTranscript] = useState(SAMPLE_TRANSCRIPT);
  const [result, setResult] = useState<VoiceActions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/voice-notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transcript, audioStub: true }),
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
      setResult(data.result as VoiceActions);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Voice notes lab"
      description="Paste a transcript (audio upload is an optional stub) - chapters, summary, and action items via generateObject."
      onReset={() => {
        setTranscript(SAMPLE_TRANSCRIPT);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Transcript" htmlFor="transcript">
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-36 text-sm"
          />
        </Field>
        <p className="text-xs text-fd-muted-foreground">
          Audio file upload is stubbed — paste text instead. Missing AI keys return honest 503.
        </p>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Structuring…' : 'Extract chapters + actions'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3">
            <div className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm">
              <p className="text-[10px] uppercase tracking-wide text-fd-muted-foreground">
                Summary
              </p>
              <p className="mt-1">{result.summary}</p>
            </div>
            <ul className="space-y-2">
              {result.chapters.map((ch, i) => (
                <li
                  key={i}
                  className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm"
                >
                  <p className="font-medium">
                    {ch.title}{' '}
                    <span className="text-xs font-normal text-fd-muted-foreground">
                      ({ch.startHint})
                    </span>
                  </p>
                  <p className="mt-1 text-fd-muted-foreground">{ch.summary}</p>
                </li>
              ))}
            </ul>
            {result.actions.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {result.actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
