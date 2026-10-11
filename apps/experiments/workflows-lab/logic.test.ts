import { describe, expect, it } from 'vitest';
import {
  buildWorkflowTimeline,
  demoOrderWorkflowPlan,
  parseSleepToken,
} from './logic';

describe('demoOrderWorkflowPlan', () => {
  it('includes sleep between charge and confirmation', () => {
    const plan = demoOrderWorkflowPlan();
    const kinds = plan.map((step) => step.kind);
    expect(kinds).toEqual(['step', 'step', 'sleep', 'step', 'return']);
  });
});

describe('buildWorkflowTimeline', () => {
  it('accumulates timestamps', () => {
    const events = buildWorkflowTimeline([
      {
        id: 'a',
        kind: 'step',
        label: 'a',
        detail: '',
        durationMs: 100,
      },
      {
        id: 'b',
        kind: 'sleep',
        label: 'b',
        detail: '',
        durationMs: 50,
      },
    ]);
    expect(events[0]?.atMs).toBe(0);
    expect(events[1]?.atMs).toBe(100);
  });
});

describe('parseSleepToken', () => {
  it('parses common units', () => {
    expect(parseSleepToken('2s')).toBe(2000);
    expect(parseSleepToken('500ms')).toBe(500);
    expect(parseSleepToken('1m')).toBe(60_000);
  });

  it('rejects invalid tokens', () => {
    expect(parseSleepToken('soon')).toBeNull();
    expect(parseSleepToken('-1s')).toBeNull();
  });
});
