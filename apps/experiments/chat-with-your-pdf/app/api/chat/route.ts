import { generateObject } from 'ai';
import { z } from 'zod';
import { extractText } from 'unpdf';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  chunkText,
  isTextLikeFilename,
  MAX_DOC_CHARS,
  retrieveTopChunks,
  TOP_K,
  truncateText,
} from '../../../logic';

export const maxDuration = 60;

const answerSchema = z.object({
  answer: z.string(),
  citations: z.array(
    z.object({
      quote: z.string(),
      chunkIndex: z.number().int().min(0),
    }),
  ),
});

async function readDocument(request: Request): Promise<
  | { ok: true; document: string; question: string }
  | { ok: false; status: number; error: string }
> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const question = String(form.get('question') ?? '').trim();
    let document = String(form.get('document') ?? '');
    const file = form.get('file');
    if (file instanceof File && file.size > 0) {
      if (!isTextLikeFilename(file.name)) {
        return { ok: false, status: 400, error: 'Upload .txt, .md, or .pdf.' };
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const result = await extractText(bytes, { mergePages: true });
          document = result.text;
          if (!document.trim()) {
            return {
              ok: false,
              status: 400,
              error: 'Could not extract text from this PDF.',
            };
          }
        } catch {
          return {
            ok: false,
            status: 400,
            error: 'PDF parse failed. Paste text or use a text-based PDF.',
          };
        }
      } else {
        document = new TextDecoder().decode(bytes);
      }
    }
    if (!question) return { ok: false, status: 400, error: 'question is required.' };
    if (!document.trim()) {
      return { ok: false, status: 400, error: 'Provide document text or a file.' };
    }
    return { ok: true, document, question };
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON body' };
  }
  const question =
    typeof (json as { question?: unknown })?.question === 'string'
      ? (json as { question: string }).question.trim()
      : '';
  const document =
    typeof (json as { document?: unknown })?.document === 'string'
      ? (json as { document: string }).document
      : '';
  if (!question) return { ok: false, status: 400, error: 'question is required.' };
  if (!document.trim()) {
    return { ok: false, status: 400, error: 'document is required.' };
  }
  return { ok: true, document, question };
}

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  const source = await readDocument(request);
  if (!source.ok) {
    return Response.json({ error: source.error }, { status: source.status });
  }

  const document = truncateText(source.document, MAX_DOC_CHARS);
  const chunks = chunkText(document);
  if (chunks.length === 0) {
    return Response.json({ error: 'Document produced no chunks.' }, { status: 400 });
  }

  const retrieved = retrieveTopChunks(source.question, chunks, TOP_K);
  const context = retrieved
    .map((c) => `[chunk ${c.index}]\n${c.text}`)
    .join('\n\n');

  const result = await generateObject({
    model: resolveModel(),
    schema: answerSchema,
    prompt: `Answer the question using ONLY the retrieved document chunks.
Cite short quotes with the correct chunkIndex from the context labels.
If the answer is not in the chunks, say you cannot find it.

QUESTION: ${source.question}

CONTEXT:
${context}`,
  });

  return Response.json({
    ...result.object,
    retrievedChunkIndexes: retrieved.map((c) => c.index),
    chunkCount: chunks.length,
    provider: providerLabel(),
  });
}
