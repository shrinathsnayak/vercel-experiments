'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import {
  buildSizesAttribute,
  compareFormats,
  computeSrcSet,
  nextImageExample,
} from './logic';

const DEFAULT_WIDTHS = [640, 828, 1080, 1200, 1920];

export default function ImageOptimizationLabDemo() {
  const [width, setWidth] = useState(1200);
  const [quality, setQuality] = useState(75);
  const [path, setPath] = useState('/demo-hero.svg');

  const srcSet = useMemo(() => computeSrcSet(path, DEFAULT_WIDTHS), [path]);
  const sizes = useMemo(
    () =>
      buildSizesAttribute([
        { minWidth: 1024, size: '50vw' },
        { minWidth: 640, size: '75vw' },
      ]),
    [],
  );
  const comparisons = useMemo(() => compareFormats(width, quality), [width, quality]);

  return (
    <DemoShell
      title="Image optimization lab"
      description="Live next/image preview plus responsive srcset patterns and format heuristics."
      example={nextImageExample(width, quality)}
      onReset={() => {
        setWidth(1200);
        setQuality(75);
        setPath('/demo-hero.svg');
      }}
    >
      <DemoStatus tone="success">
        Preview below uses real <code className="font-mono">next/image</code> (Vercel Image
        Optimization in production). Byte table remains a teaching heuristic.
      </DemoStatus>
      <div className="mt-4 overflow-hidden rounded-md border">
        <Image
          src={path.startsWith('/') ? path : '/demo-hero.svg'}
          alt="Optimized demo hero"
          width={Math.min(width, 1200)}
          height={Math.round((Math.min(width, 1200) * 9) / 16)}
          quality={quality}
          sizes={sizes}
          className="h-auto w-full object-cover"
          priority
        />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Display width (px)">
            <Slider
              min={320}
              max={2400}
              step={40}
              value={[width]}
              onValueChange={(v) => setWidth(v[0] ?? width)}
              aria-valuetext={`${width} pixels`}
            />
            <span className="text-xs text-fd-muted-foreground">{width}px</span>
          </Field>
          <Field label="Quality">
            <Slider
              min={40}
              max={100}
              step={1}
              value={[quality]}
              onValueChange={(v) => setQuality(v[0] ?? quality)}
              aria-valuetext={`${quality}`}
            />
            <span className="text-xs text-fd-muted-foreground">{quality}</span>
          </Field>
          <Field label="Sample path">
            <Input
              className="font-mono text-xs"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </Field>
        </div>
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            Generated attributes
          </h3>
          <pre className="overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
            {`srcSet="${srcSet}"\nsizes="${sizes}"`}
          </pre>
          <table className="w-full text-xs">
            <caption className="mb-2 text-left text-fd-muted-foreground">
              Estimated transfer sizes at {width}px (heuristic)
            </caption>
            <thead>
              <tr className="border-b border-fd-border text-left">
                <th className="py-1 pr-2 font-medium">Format</th>
                <th className="py-1 font-medium">Est. bytes</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row) => (
                <tr key={row.format} className="border-b border-fd-border/60">
                  <td className="py-1.5 pr-2 font-mono uppercase">{row.format}</td>
                  <td className="py-1.5">{row.estimatedBytes.toLocaleString()} B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DemoShell>
  );
}
