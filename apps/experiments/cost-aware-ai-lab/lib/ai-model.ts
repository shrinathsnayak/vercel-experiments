import { openai } from '@ai-sdk/openai';
import { getServiceStatus } from './services';

export function resolveModelId(modelId: string) {
  const gateway = getServiceStatus('ai-gateway');
  if (gateway.available) {
    return modelId.includes('/') ? modelId : `openai/${modelId}`;
  }
  return openai(modelId.replace(/^openai\//, ''));
}

export function providerLabel(): 'ai-gateway' | 'openai' {
  return getServiceStatus('ai-gateway').available ? 'ai-gateway' : 'openai';
}

export const AI_SETUP_BODY = {
  error: 'No AI provider configured',
  setup:
    'Add AI_GATEWAY_API_KEY (recommended) or OPENAI_API_KEY to your environment and restart. On Vercel, use one-click deploy or create a Gateway key in the dashboard. This demo never fabricates model output.',
  preferred: 'AI_GATEWAY_API_KEY',
} as const;
