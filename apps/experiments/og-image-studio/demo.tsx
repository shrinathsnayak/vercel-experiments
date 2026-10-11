'use client';

import { useMemo, useState } from 'react';
import { DemoShell } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { buildOgStudioUrl, type OgStudioParams } from './logic';

const defaults: OgStudioParams = {
  title: 'Ship faster with Next.js',
  description: 'Generate Open Graph images locally with ImageResponse.',
  theme: 'light',
  layout: 'default',
  width: 1200,
  height: 630,
};

export default function OgImageStudioDemo() {
  const [params, setParams] = useState<OgStudioParams>(defaults);
  const [cacheBust, setCacheBust] = useState(0);

  const previewUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const base = buildOgStudioUrl(window.location.origin, params);
    const url = new URL(base);
    url.searchParams.set('v', String(cacheBust));
    return url.toString();
  }, [params, cacheBust]);

  const downloadUrl = previewUrl;

  return (
    <DemoShell
      title="OG Image Studio"
      description="Edit copy and layout, preview via the local /api/og/studio route (no remote URLs)."
      onReset={() => {
        setParams(defaults);
        setCacheBust((v) => v + 1);
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <Field label="Title" htmlFor="og-title">
            <Input
              id="og-title"
              className="text-sm"
              value={params.title}
              maxLength={120}
              onChange={(e) => setParams((p) => ({ ...p, title: e.target.value }))}
            />
          </Field>
          <Field label="Description" htmlFor="og-description">
            <Textarea
              id="og-description"
              className="min-h-20 text-sm"
              value={params.description}
              maxLength={240}
              onChange={(e) => setParams((p) => ({ ...p, description: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Theme" htmlFor="og-theme">
              <Select
                value={params.theme}
                onValueChange={(v) =>
                  setParams((p) => ({ ...p, theme: v as OgStudioParams['theme'] }))
                }
              >
                <SelectTrigger id="og-theme" className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Layout" htmlFor="og-layout">
              <Select
                value={params.layout}
                onValueChange={(v) =>
                  setParams((p) => ({ ...p, layout: v as OgStudioParams['layout'] }))
                }
              >
                <SelectTrigger id="og-layout" className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="centered">Centered</SelectItem>
                  <SelectItem value="split">Split</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Width" htmlFor="og-width">
              <Input
                id="og-width"
                type="number"
                min={400}
                max={1200}
                className="text-sm"
                value={params.width}
                onChange={(e) => setParams((p) => ({ ...p, width: Number(e.target.value) }))}
              />
            </Field>
            <Field label="Height" htmlFor="og-height">
              <Input
                id="og-height"
                type="number"
                min={200}
                max={630}
                className="text-sm"
                value={params.height}
                onChange={(e) => setParams((p) => ({ ...p, height: Number(e.target.value) }))}
              />
            </Field>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setCacheBust((v) => v + 1)}>
            Refresh preview
          </Button>
        </form>
        <div className="space-y-3">
          <p className="text-xs text-fd-muted-foreground">Live preview</p>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={`Open Graph preview: ${params.title}`}
              className="w-full rounded-md border border-fd-border bg-fd-muted/20"
            />
          ) : null}
          {downloadUrl ? (
            <Button variant="outline" size="sm" asChild>
              <a href={downloadUrl} download="og-image.png">
                Download image
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </DemoShell>
  );
}
