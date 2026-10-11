'use client';

import { useMemo, useState } from 'react';
import { DemoShell } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { batchUrls, normalizeTheme, SAMPLE_THEME, SAMPLE_TITLE, THEMES } from './logic';

export default function ThumbnailFactoryDemo() {
  const [title, setTitle] = useState(SAMPLE_TITLE);
  const [theme, setTheme] = useState(SAMPLE_THEME);
  const [built, setBuilt] = useState(false);
  const urls = useMemo(
    () => (built ? batchUrls('', title, normalizeTheme(theme)) : []),
    [built, title, theme],
  );

  return (
    <DemoShell title="Thumbnail factory" description="Title/theme - ImageResponse batch thumbs."
      onReset={() => { setTitle(SAMPLE_TITLE); setTheme(SAMPLE_THEME); setBuilt(false); }}>
      <div className="space-y-4">
        <Field label="Title" htmlFor="title"><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Theme" htmlFor="theme">
          <select id="theme" className="w-full rounded-md border border-fd-border bg-transparent px-3 py-2 text-sm"
            value={theme} onChange={(e) => setTheme(normalizeTheme(e.target.value))}>
            {Object.keys(THEMES).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Button type="button" variant="secondary" size="sm" onClick={() => setBuilt(true)}>Build batch</Button>
        <div className="grid gap-3 sm:grid-cols-2">
          {urls.map((u) => (
            <div key={u.name} className="space-y-1">
              <p className="text-xs uppercase text-fd-muted-foreground">{u.name}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u.url} alt={u.name} className="w-full rounded-md border border-fd-border" />
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
