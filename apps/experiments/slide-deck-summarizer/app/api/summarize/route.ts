import { streamText } from 'ai';
import { extractText } from 'unpdf';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  isSupportedFilename,
  MAX_TEXT_CHARS,
  splitSlides,
  truncateText,
} from '../../../logic';

export const maxDuration = 60;

async function readSource(request: Request): Promise<
  { ok: true; text: string } | { ok: false; status: number; error: string }
> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const pasted = String(form.get('text') ?? '');
    const file = form.get('file');
    if (file instanceof File && file.size > 0) {
      if (!isSupportedFilename(file.name)) {
        return { ok: false, status: 400, error: 'Upload a .txt, .md, or .pdf file.' };
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const result = await extractText(bytes, { mergePages: true });
          const text = result.text.trim();
          if (!text) {
            return {
              ok: false,
              status: 400,
              error: 'Could not extract text from this PDF.',
            };
          }
          return { ok: true, text };
        } catch {
          return {
            ok: false,
            status: 400,
            error: 'PDF parse failed. Paste text instead.',
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
  const text =
    typeof (json as { text?: unknown })?.text === 'string'
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
  const slides = splitSlides(text);
  if (!text || slides.length === 0) {
    return Response.json({ error: 'No slide content found.' }, { status: 400 });
  }

  const numbered = slides
    .map((slide, i) => `### Slide ${i + 1}\n${slide}`)
    .join('\n\n');

  const result = streamText({
    model: resolveModel(),
    prompt: `Summarize this slide deck.
For each slide, write 2–4 short bullets.
Then write a short executive brief (3–5 sentences).

DECK (max ${MAX_TEXT_CHARS} chars, ${slides.length} slides):
${numbered}`,
  });

  return result.toTextStreamResponse({
    headers: {
      'x-ai-provider': providerLabel(),
      'x-slide-count': String(slides.length),
    },
  });
}
