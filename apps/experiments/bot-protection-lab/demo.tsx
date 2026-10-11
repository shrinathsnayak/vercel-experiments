'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { botSnippet } from './logic';

export default function BotProtectionLabDemo() {
  const [question, setQuestion] = useState<string>('');
  const [challengeId, setChallengeId] = useState('');
  const [issuedAt, setIssuedAt] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<string>('');
  const [allowed, setAllowed] = useState<boolean | null>(null);

  async function issue() {
    const res = await fetch('/api/challenge', { method: 'POST' });
    const data = await res.json();
    setQuestion(data.question);
    setChallengeId(data.challengeId);
    setIssuedAt(Date.now());
    setAnswer('');
    setResult(data.note ?? '');
    setAllowed(null);
  }

  async function submit() {
    const res = await fetch('/api/expensive', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        challengeId,
        answer: Number(answer),
        issuedAt,
        prompt: 'Explain bot gates before AI routes',
      }),
    });
    const data = await res.json();
    setAllowed(Boolean(data.allowed));
    setResult(JSON.stringify(data, null, 2));
  }

  return (
    <DemoShell
      title="Bot protection lab"
      description="Challenge + rate-limit gate before a mock expensive AI route. Documents BotID concepts with honest limits."
      example={botSnippet()}
      onReset={() => {
        setQuestion('');
        setChallengeId('');
        setAnswer('');
        setResult('');
        setAllowed(null);
      }}
    >
      <DemoStatus tone="warning">
        This lab does not integrate Vercel BotID. It teaches a challenge + rate-limit pattern you can place in front of costly routes.
      </DemoStatus>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void issue()}>
            Issue challenge
          </Button>
          <Button type="button" variant="outline" disabled={!challengeId} onClick={() => void submit()}>
            Call expensive route
          </Button>
        </div>
        {question ? (
          <Field label="Challenge">
            <p className="text-sm font-medium">{question}</p>
            <Input
              className="mt-2 font-mono"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer"
              inputMode="numeric"
            />
          </Field>
        ) : null}
        {allowed === true ? <DemoStatus tone="success">Allowed</DemoStatus> : null}
        {allowed === false ? <DemoStatus tone="error">Blocked</DemoStatus> : null}
        <pre className="max-h-72 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
          {result || 'Issue a challenge, answer it, then call the expensive route.'}
        </pre>
      </div>
    </DemoShell>
  );
}
