'use client';

import { useCallback, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import {
  parseAllowlistedArithmetic,
  SANDBOX_SETUP_REQUIREMENTS,
} from './logic';

export default function AiCodeSandboxDemo() {
  const [expression, setExpression] = useState('(2 + 3) * 4 / 2');
  const [localResult, setLocalResult] = useState<string | null>(null);
  const [remoteResult, setRemoteResult] = useState<string | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);

  const evaluateLocally = useCallback(() => {
    const parsed = parseAllowlistedArithmetic(expression);
    if (parsed.ok) {
      setLocalResult(String(parsed.value));
    } else {
      setLocalResult(`Error: ${parsed.error}`);
    }
  }, [expression]);

  async function evaluateViaApi() {
    setRemoteLoading(true);
    setRemoteResult(null);
    try {
      const res = await fetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ expression }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        value?: number;
        error?: string;
        message?: string;
      };
      if (res.status === 503) {
        setRemoteResult(data.message ?? 'Isolated execution unavailable (setup required).');
        return;
      }
      if (data.ok && typeof data.value === 'number') {
        setRemoteResult(String(data.value));
      } else {
        setRemoteResult(data.error ?? 'Request failed');
      }
    } catch {
      setRemoteResult('Network error calling sandbox API');
    } finally {
      setRemoteLoading(false);
    }
  }

  return (
    <DemoShell
      title="AI code sandbox (gated)"
      description="Allowlisted arithmetic inside Vercel Sandbox when SANDBOX_ENABLED=true - never unrestricted eval."
      onReset={() => {
        setExpression('(2 + 3) * 4 / 2');
        setLocalResult(null);
        setRemoteResult(null);
      }}
    >
      <DemoStatus tone="warning">
        Set SANDBOX_ENABLED=true on Vercel to run inside a Sandbox microVM (network denied). User
        JavaScript is never eval&apos;d in the main app process.
      </DemoStatus>
      <div className="mt-4 space-y-4">
        <Field label="Arithmetic expression (allowlisted)">
          <Input
            className="font-mono text-xs"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            spellCheck={false}
            aria-describedby="sandbox-expr-hint"
          />
        </Field>
        <p id="sandbox-expr-hint" className="text-[11px] text-fd-muted-foreground">
          Allowed: digits, + − * /, parentheses, spaces. No identifiers, functions, or arbitrary JS.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={evaluateLocally}>
            Parse locally (AST)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={evaluateViaApi}
            disabled={remoteLoading}
          >
            {remoteLoading ? 'Calling API…' : 'Try isolated API stub'}
          </Button>
        </div>
        {localResult ? (
          <p className="font-mono text-xs">
            Local parser: <span className="text-fd-foreground">{localResult}</span>
          </p>
        ) : null}
        {remoteResult ? (
          <p className="font-mono text-xs">
            API: <span className="text-fd-foreground">{remoteResult}</span>
          </p>
        ) : null}
        <div className="rounded-md border border-fd-border p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            Production sandbox requirements
          </h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-fd-muted-foreground">
            {SANDBOX_SETUP_REQUIREMENTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </DemoShell>
  );
}
