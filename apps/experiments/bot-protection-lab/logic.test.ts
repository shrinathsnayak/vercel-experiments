import { describe, expect, it } from 'vitest';
import { evaluateGate, scoreClientSignals } from './logic';

describe('bot-protection-lab', () => {
  it('scores bots lower', () => {
    const human = scoreClientSignals({
      answeredCorrectly: true,
      answerLatencyMs: 1200,
      userAgent: 'Mozilla/5.0',
      recentFailures: 0,
    });
    const bot = scoreClientSignals({
      answeredCorrectly: false,
      answerLatencyMs: 10,
      userAgent: 'python-requests/2.31',
      recentFailures: 2,
    });
    expect(human).toBeGreaterThan(bot);
  });

  it('gates expensive routes', () => {
    expect(evaluateGate({
      tokenPresent: true,
      answerCorrect: true,
      expired: false,
      rateLimited: false,
      replay: false,
    }).allowed).toBe(true);
    expect(evaluateGate({
      tokenPresent: false,
      answerCorrect: true,
      expired: false,
      rateLimited: false,
      replay: false,
    }).reason).toBe('missing-token');
  });
});
