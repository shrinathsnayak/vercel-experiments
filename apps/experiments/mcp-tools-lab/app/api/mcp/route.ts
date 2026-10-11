import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CATALOG, getBySlug, searchCatalog } from '../../../logic';

/**
 * Lightweight MCP-shaped JSON tools endpoint for the standalone experiment.
 * The hub uses @modelcontextprotocol/server + fumadocs; this lab exposes the same
 * catalog search idea over a local registry snapshot without requiring the full docs stack.
 */

const rpcSchema = z.object({
  method: z.enum(['tools/list', 'tools/call', 'initialize']),
  params: z
    .object({
      name: z.string().optional(),
      arguments: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
});

const tools = [
  {
    name: 'search_experiments',
    description: 'Search the Phase 5 experiment catalog snapshot by keyword.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
  {
    name: 'get_experiment',
    description: 'Get one experiment by slug from the local registry snapshot.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string' } },
      required: ['slug'],
    },
  },
  {
    name: 'list_experiments',
    description: 'List all experiments in the local snapshot.',
    inputSchema: { type: 'object', properties: {} },
  },
];

export async function GET() {
  return NextResponse.json({
    name: 'vercel-experiments-mcp-lab',
    version: '1.0.0',
    tools,
    catalogSize: CATALOG.length,
    note: 'POST JSON-RPC-like { method, params } for tools/list or tools/call. Educational standalone - hub MCP lives at apps/docs/app/api/mcp.',
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = rpcSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid RPC body' }, { status: 400 });
  }

  if (parsed.data.method === 'initialize') {
    return NextResponse.json({
      protocolVersion: '2024-11-05',
      serverInfo: { name: 'vercel-experiments-mcp-lab', version: '1.0.0' },
      capabilities: { tools: {} },
    });
  }

  if (parsed.data.method === 'tools/list') {
    return NextResponse.json({ tools });
  }

  const name = parsed.data.params?.name;
  const args = parsed.data.params?.arguments ?? {};
  if (name === 'search_experiments') {
    const query = String(args.query ?? '');
    const results = searchCatalog(query);
    return NextResponse.json({
      content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
      structuredContent: { results },
    });
  }
  if (name === 'get_experiment') {
    const slug = String(args.slug ?? '');
    const item = getBySlug(slug);
    if (!item) {
      return NextResponse.json({ error: 'Not found', slug }, { status: 404 });
    }
    return NextResponse.json({
      content: [{ type: 'text', text: JSON.stringify(item, null, 2) }],
      structuredContent: { experiment: item },
    });
  }
  if (name === 'list_experiments') {
    return NextResponse.json({
      content: [{ type: 'text', text: JSON.stringify(CATALOG, null, 2) }],
      structuredContent: { experiments: CATALOG },
    });
  }

  return NextResponse.json({ error: 'Unknown tool', name }, { status: 400 });
}
