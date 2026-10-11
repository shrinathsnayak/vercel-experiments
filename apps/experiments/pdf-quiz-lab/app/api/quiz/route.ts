import { generateObject } from 'ai';
import { z } from 'zod';
import { extractText } from 'unpdf';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { isTextLikeFilename, MAX_TEXT_CHARS, truncateText } from '../../../logic';

export const maxDuration = 60;

const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        choices: z.tuple([z.string(), z.string(), z.string(), z.string()]),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string(),
      }),
    )
    .length(5),
});

async function extractFromPdf(bytes: Uint8Array): Promise<string> {
  const result = await extractText(bytes, { mergePages: true });
  return result.text.trim();
}

async function readSource(request: Request): Promise<
  { ok: true; text: string } | { ok: false; status: number; error: string }
> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const pasted = String(form.get('text') ?? '');
    const file = form.get('file');
    if (file instanceof File && file.size > 0) {
      if (!isTextLikeFilename(file.name)) {
        return { ok: false, status: 400, error: 'Upload a .txt, .md, or .pdf file.' };
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const text = await extractFromPdf(bytes);
          if (!text.trim()) {
            return {
              ok: false,
              status: 400,
              error: 'Could not extract text from this PDF (empty or image-only).',
            };
          }
          return { ok: true, text };
        } catch {
          return {
            ok: false,
            status: 400,
            error: 'PDF parse failed. Try a text-based PDF or paste the text instead.',
          };
        }
      }
      return { ok: true, text: new TextDecoder().decode(bytes) };
    }
    if (!pasted.trim()) {
      return { ok: false, status: 400, error: 'Provide text or a file.' };
    }
    return { ok: true, text: pasted };
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON body' };
  }
  const text = typeof (json as { text?: unknown })?.text === 'string'
    ? (json as { text: string }).text
    : '';
  if (!text.trim()) {
    return { ok: false, status: 400, error: 'Provide text.' };
  }
  return { ok: true, text };
}

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  const source = await readSource(request);
  if (!source.ok) {
    return Response.json({ error: source.error }, { status: source.status });
  }

  const text = truncateText(source.text);
  if (!text) {
    return Response.json({ error: 'Text is empty after trimming.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: quizSchema,
    prompt: `Create exactly 5 multiple-choice quiz questions from the source text below.
Each question must have 4 short choices and correctIndex 0-3.
Keep questions grounded in the text; do not invent facts outside it.

SOURCE (capped at ${MAX_TEXT_CHARS} chars):
${text}`,
  });

  return Response.json({
    ...result.object,
    charsUsed: text.length,
    provider: providerLabel(),
  });
}
