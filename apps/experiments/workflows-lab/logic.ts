export type WorkflowStepKind = 'step' | 'sleep' | 'return';

export type WorkflowPlanStep = {
  id: string;
  kind: WorkflowStepKind;
  label: string;
  detail: string;
  /** Educational duration shown in the simulator (ms). */
  durationMs: number;
};

export type WorkflowTimelineEvent = {
  atMs: number;
  stepId: string;
  label: string;
  kind: WorkflowStepKind;
  note: string;
};

/** Demo order workflow plan matching the real `'use workflow'` / `'use step'` shape. */
export function demoOrderWorkflowPlan(): WorkflowPlanStep[] {
  return [
    {
      id: 'reserve',
      kind: 'step',
      label: 'reserveInventory',
      detail: 'Side-effect step: reserve stock for the order.',
      durationMs: 120,
    },
    {
      id: 'charge',
      kind: 'step',
      label: 'chargePayment',
      detail: 'Side-effect step: charge the payment method (retried on throw).',
      durationMs: 180,
    },
    {
      id: 'pause',
      kind: 'sleep',
      label: 'sleep("2s")',
      detail: 'Durable pause - no compute consumed while waiting.',
      durationMs: 2000,
    },
    {
      id: 'email',
      kind: 'step',
      label: 'sendConfirmation',
      detail: 'Side-effect step: send the confirmation email.',
      durationMs: 100,
    },
    {
      id: 'done',
      kind: 'return',
      label: 'return result',
      detail: 'Workflow completes with { orderId, status: "confirmed" }.',
      durationMs: 0,
    },
  ];
}

/** Build a cumulative educational timeline from a plan (client-side simulator). */
export function buildWorkflowTimeline(
  plan: WorkflowPlanStep[] = demoOrderWorkflowPlan(),
): WorkflowTimelineEvent[] {
  let cursor = 0;
  return plan.map((step) => {
    const event: WorkflowTimelineEvent = {
      atMs: cursor,
      stepId: step.id,
      label: step.label,
      kind: step.kind,
      note: step.detail,
    };
    cursor += Math.max(0, step.durationMs);
    return event;
  });
}

export function parseSleepToken(token: string): number | null {
  const trimmed = token.trim().toLowerCase();
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h|d)$/.exec(trimmed);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value < 0) return null;
  const unit = match[2];
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return Math.round(value * multipliers[unit]);
}

export function workflowStartSnippet(): string {
  return `import { start } from 'workflow/api';
import { processDemoOrder } from '@/workflows/demo-order';

const run = await start(processDemoOrder, [orderId]);
return Response.json({ runId: run.runId });`;
}

export const WORKFLOW_SETUP_REQUIREMENTS = [
  'Install the workflow package and wrap next.config with withWorkflow().',
  'Deploy to Vercel (or use vercel dev) so Queues + managed persistence can run the workflow.',
  'Inspect runs with `npx workflow web` or the Observability → Workflows dashboard.',
] as const;
