import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import {
  chunkMarkdownFiles,
  MAX_FILES,
  retrieveTopChunks,
  TOP_K,
  truncateText,
  type MdFile,
} from '../../../logic';

export const maxDuration = 60;

const answerSchema = z.object({
  answer: z.string(),
  citations: z.array(z.object({ file: z.string(), quote: z.string() })),
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const question =
    typeof (json as { question?: unknown })?.question === 'string'
      ? (json as { question: string }).question.trim()
      : '';
  const filesRaw = Array.isArray((json as { files?: unknown })?.files)
    ? ((json as { files: MdFile[] }).files as MdFile[])
    : [];

  if (!question) return Response.json({ error: 'question is required.' }, { status: 400 });

  const files = filesRaw
    .slice(0, MAX_FILES)
    .map((f) => ({
      name: String(f.name || 'doc.md').slice(0, 80),
      content: truncateText(String(f.content || ''), 20_000),
    }))
    .filter((f) => f.content);

  if (files.length === 0) {
    return Response.json({ error: 'At least one markdown file is required.' }, { status: 400 });
  }

  const chunks = chunkMarkdownFiles(files);
  const sources = retrieveTopChunks(question, chunks, TOP_K);
  const context = sources.map((c) => `[${c.file}#${c.index}]\n${c.text}`).join('\n\n');

  const result = await generateObject({
    model: resolveModel(),
    schema: answerSchema,
    prompt: `Answer using ONLY the source chunks. Cite file names.\n\nQUESTION: ${question}\n\nCONTEXT:\n${context}`,
  });

  return Response.json({
    ...result.object,
    sources,
    chunkCount: chunks.length,
    provider: providerLabel(),
  });
}
