'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { authSnippet, classifySkew } from './logic';

export default function EdgeAuthLabDemo() {
  const [token, setToken] = useState('');
  const [claims, setClaims] = useState<string>('');
  const [protectedResult, setProtectedResult] = useState('');
  const [ttl, setTtl] = useState(60);
  const [iatOffset, setIatOffset] = useState(0);
  const [tolerance, setTolerance] = useState(5);

  async function issue() {
    const res = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ttlSeconds: ttl, iatOffsetSeconds: iatOffset, sub: 'demo-user' }),
    });
    const data = await res.json();
    setToken(data.token);
    setClaims(JSON.stringify(data.claims, null, 2));
  }

  async function callProtected() {
    const res = await fetch(`/api/auth/protected?tolerance=${tolerance}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    setProtectedResult(JSON.stringify(await res.json(), null, 2));
  }

  const skewHint =
    iatOffset > tolerance
      ? classifySkew({
        nowSeconds: Math.floor(Date.now() / 1000),
        iat: Math.floor(Date.now() / 1000) + iatOffset,
        exp: Math.floor(Date.now() / 1000) + iatOffset + ttl,
        clockToleranceSeconds: tolerance,
      })
      : 'valid';

  return (
    <DemoShell
      title="Edge auth lab"
      description="Issue and verify short-lived JWTs with jose. Protect a route and explore clock-skew cases."
      example={authSnippet()}
      onReset={() => {
        setToken('');
        setClaims('');
        setProtectedResult('');
        setIatOffset(0);
      }}
    >
      <DemoStatus tone="neutral">
        Real HS256 via <code className="text-xs">jose</code> - not a toy HMAC. Skew demo hint: {skewHint}
      </DemoStatus>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="TTL seconds">
            <Input type="number" value={ttl} onChange={(e) => setTtl(Number(e.target.value))} />
          </Field>
          <Field label="iat offset seconds (positive = future / not-yet-valid)">
            <Input type="number" value={iatOffset} onChange={(e) => setIatOffset(Number(e.target.value))} />
          </Field>
          <Field label="Verify clock tolerance (seconds)">
            <Input type="number" value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void issue()}>
              Issue JWT
            </Button>
            <Button type="button" variant="outline" disabled={!token} onClick={() => void callProtected()}>
              Call protected
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <pre className="max-h-40 overflow-auto rounded-md border bg-muted/40 p-3 text-xs break-all">
            {token || 'Token will appear here.'}
          </pre>
          <pre className="max-h-32 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">{claims || 'Claims'}</pre>
          <pre className="max-h-40 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
            {protectedResult || 'Protected response'}
          </pre>
        </div>
      </div>
    </DemoShell>
  );
}
