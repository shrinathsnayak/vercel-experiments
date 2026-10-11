'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { mcpSnippet } from './logic';

export default function McpToolsLabDemo() {
  const [query, setQuery] = useState('geo');
  const [slug, setSlug] = useState('edge-auth-lab');
  const [out, setOut] = useState('');

  async function listTools() {
    const res = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ method: 'tools/list' }),
    });
    setOut(JSON.stringify(await res.json(), null, 2));
  }

  async function search() {
    const res = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: { name: 'search_experiments', arguments: { query } },
      }),
    });
    setOut(JSON.stringify(await res.json(), null, 2));
  }

  async function getOne() {
    const res = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: { name: 'get_experiment', arguments: { slug } },
      }),
    });
    setOut(JSON.stringify(await res.json(), null, 2));
  }

  return (
    <DemoShell
      title="MCP tools lab"
      description="Standalone MCP-shaped tool server exposing experiment catalog search over a registry snapshot."
      example={mcpSnippet()}
      onReset={() => setOut('')}
    >
      <DemoStatus tone="neutral">
        Hub MCP (docs search) lives at <code className="text-xs">apps/docs/app/api/mcp</code>. This lab is a
        focused catalog-tools experiment you can deploy alone.
      </DemoStatus>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void listTools()}>
            tools/list
          </Button>
          <Button type="button" onClick={() => void search()}>
            search_experiments
          </Button>
          <Button type="button" variant="secondary" onClick={() => void getOne()}>
            get_experiment
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Search query">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} />
          </Field>
          <Field label="Slug">
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono text-xs" />
          </Field>
        </div>
        <pre className="max-h-80 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">{out || 'Call a tool.'}</pre>
      </div>
    </DemoShell>
  );
}
