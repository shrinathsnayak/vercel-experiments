import { NextResponse } from 'next/server';
import { z } from 'zod';
import { evaluateGate, scoreClientSignals } from '../../../logic';
import { checkRateLimit, consumeChallenge } from '../../../lib/challenge-store';

const bodySchema = z.object({
  challengeId: z.string().uuid(),
  answer: z.number().int(),
  issuedAt: z.number().optional(),
  prompt: z.string().max(200).default('Summarize edge bot protection'),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const ua = request.headers.get('user-agent') || '';
  const now = Date.now();
  const rl = checkRateLimit(`expensive:${ip}`, 8, 60_000, now);
  if (!rl.allowed) {
    return NextResponse.json(
      { allowed: false, reason: 'rate-limited', remaining: 0, retryAfterMs: rl.retryAfterMs },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const consume = consumeChallenge(parsed.data.challengeId, parsed.data.answer, now);
  const latency = parsed.data.issuedAt ? now - parsed.data.issuedAt : 1000;
  const score = scoreClientSignals({
    answeredCorrectly: consume === 'ok',
    answerLatencyMs: latency,
    userAgent: ua,
    recentFailures: consume === 'ok' ? 0 : 1,
  });

  const decision = evaluateGate({
    tokenPresent: true,
    answerCorrect: consume === 'ok',
    expired: consume === 'expired',
    rateLimited: false,
    replay: consume === 'replay',
  });

  if (!decision.allowed || score < 40) {
    return NextResponse.json(
      {
        allowed: false,
        reason: decision.reason === 'ok' ? 'low-score' : decision.reason,
        score,
        note: 'Blocked before mock AI work. This is a demo challenge + rate-limit pattern, not BotID.',
      },
      { status: 403 },
    );
  }

  // Mock expensive AI work
  await new Promise((r) => setTimeout(r, 120));
  return NextResponse.json({
    allowed: true,
    score,
    remaining: rl.remaining,
    mockAi: {
      prompt: parsed.data.prompt,
      output:
        'Edge bot protection typically combines platform signals (BotID), challenges, and rate limits before expensive inference.',
    },
    note: 'Allowed through demo gate. For production, use Vercel BotID + your own quotas.',
  });
}
