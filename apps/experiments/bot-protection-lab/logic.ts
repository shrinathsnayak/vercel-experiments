export type ChallengeIssue = {
  challengeId: string;
  question: string;
  issuedAt: number;
  expiresAt: number;
};

export type GateDecision = {
  allowed: boolean;
  reason: 'ok' | 'missing-token' | 'bad-answer' | 'expired' | 'rate-limited' | 'replay';
  remaining?: number;
};

/** Educational bot score (0–100). Not Vercel BotID. */
export function scoreClientSignals(input: {
  answeredCorrectly: boolean;
  answerLatencyMs: number;
  userAgent: string;
  recentFailures: number;
}): number {
  let score = 50;
  if (input.answeredCorrectly) score += 30;
  else score -= 40;
  if (input.answerLatencyMs < 80) score -= 25; // suspiciously fast
  else if (input.answerLatencyMs > 400 && input.answerLatencyMs < 30_000) score += 10;
  if (/bot|crawl|spider|curl|python-requests/i.test(input.userAgent)) score -= 35;
  score -= Math.min(30, input.recentFailures * 10);
  return Math.max(0, Math.min(100, score));
}

export function createChallenge(now = Date.now(), ttlMs = 60_000): ChallengeIssue & { answer: number } {
  const a = 2 + Math.floor(Math.random() * 8);
  const b = 2 + Math.floor(Math.random() * 8);
  const challengeId = crypto.randomUUID();
  return {
    challengeId,
    question: `What is ${a} + ${b}?`,
    answer: a + b,
    issuedAt: now,
    expiresAt: now + ttlMs,
  };
}

export function evaluateGate(input: {
  tokenPresent: boolean;
  answerCorrect: boolean;
  expired: boolean;
  rateLimited: boolean;
  replay: boolean;
}): GateDecision {
  if (input.rateLimited) return { allowed: false, reason: 'rate-limited' };
  if (!input.tokenPresent) return { allowed: false, reason: 'missing-token' };
  if (input.replay) return { allowed: false, reason: 'replay' };
  if (input.expired) return { allowed: false, reason: 'expired' };
  if (!input.answerCorrect) return { allowed: false, reason: 'bad-answer' };
  return { allowed: true, reason: 'ok' };
}

export function botSnippet(): string {
  return `// Demo pattern (NOT Vercel BotID)
// 1) Issue a short-lived challenge
// 2) Verify answer + rate-limit expensive routes
// For production BotID, integrate @vercel/botid separately.`;
}
