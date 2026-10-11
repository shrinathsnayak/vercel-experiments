import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { MAX_FIELD_CHARS, normalizeFitResult, truncateText } from '../../../logic';

export const maxDuration = 60;

const fitSchema = z.object({
  matchScore: z.number().min(0).max(100),
  missingSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  rewrittenBullets: z.array(z.string()),
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

  const jobDescription =
    typeof (json as { jobDescription?: unknown })?.jobDescription === 'string'
      ? truncateText((json as { jobDescription: string }).jobDescription)
      : '';
  const resume =
    typeof (json as { resume?: unknown })?.resume === 'string'
      ? truncateText((json as { resume: string }).resume)
      : '';

  if (!jobDescription || !resume) {
    return Response.json(
      { error: 'Both jobDescription and resume are required.' },
      { status: 400 },
    );
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: fitSchema,
    prompt: `Compare the resume to the job description.
Return matchScore 0-100, missingSkills the job wants but resume lacks,
strengths that align well, and rewrittenBullets (improved resume bullets tailored to the JD).

JOB DESCRIPTION (max ${MAX_FIELD_CHARS} chars):
${jobDescription}

RESUME:
${resume}`,
  });

  return Response.json({
    ...normalizeFitResult(result.object),
    provider: providerLabel(),
  });
}
