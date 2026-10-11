'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { kitUrls, normalizeHex, normalizeLetter, SAMPLE_COLOR, SAMPLE_LETTER } from './logic';

export default function FaviconBrandKitDemo() {
  const [color, setColor] = useState(SAMPLE_COLOR);
  const [letter, setLetter] = useState(SAMPLE_LETTER);
  const [built, setBuilt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urls = useMemo(() => {
    if (!built) return [];
    const hex = normalizeHex(color);
    if (!hex) return [];
    return kitUrls('', hex, normalizeLetter(letter));
  }, [built, color, letter]);

  function build() {
    if (!normalizeHex(color)) { setError('Use a 6-digit hex color like #0ea5e9'); setBuilt(false); return; }
    setError(null); setBuilt(true);
  }

  return (
    <DemoShell title="Favicon brand kit" description="Color + letter - ImageResponse icon set."
      onReset={() => { setColor(SAMPLE_COLOR); setLetter(SAMPLE_LETTER); setBuilt(false); setError(null); }}>
      <div className="space-y-4">
        <Field label="Brand color" htmlFor="color"><Input id="color" value={color} onChange={(e) => setColor(e.target.value)} /></Field>
        <Field label="Letter" htmlFor="letter"><Input id="letter" value={letter} maxLength={2} onChange={(e) => setLetter(e.target.value)} /></Field>
        <Button type="button" variant="secondary" size="sm" onClick={build}>Generate kit</Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <div className="flex flex-wrap items-end gap-4">
          {urls.map((u) => (
            <div key={u.size} className="space-y-1 text-center">
              <p className="text-xs text-fd-muted-foreground">{u.size}px</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u.url} alt={`${u.size}`} width={Math.min(96, u.size)} height={Math.min(96, u.size)}
                className="rounded border border-fd-border bg-white" />
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
