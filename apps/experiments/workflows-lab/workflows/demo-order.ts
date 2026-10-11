import { sleep } from 'workflow';

export type DemoOrderResult = {
  orderId: string;
  status: 'confirmed';
  steps: string[];
};

/**
 * Durable demo workflow: reserve → charge → sleep → confirm.
 * Directives are compile-time markers for the Workflow SDK (`withWorkflow`).
 */
export async function processDemoOrder(orderId: string): Promise<DemoOrderResult> {
  'use workflow';

  const steps: string[] = [];
  await reserveInventory(orderId, steps);
  await chargePayment(orderId, steps);
  await sleep('2s');
  steps.push('sleep:2s');
  await sendConfirmation(orderId, steps);

  return { orderId, status: 'confirmed', steps };
}

async function reserveInventory(orderId: string, steps: string[]) {
  'use step';
  steps.push(`reserve:${orderId}`);
  return { reserved: true as const };
}

async function chargePayment(orderId: string, steps: string[]) {
  'use step';
  steps.push(`charge:${orderId}`);
  return { charged: true as const };
}

async function sendConfirmation(orderId: string, steps: string[]) {
  'use step';
  steps.push(`email:${orderId}`);
  return { emailed: true as const };
}
