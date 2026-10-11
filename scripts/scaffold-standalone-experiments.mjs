#!/usr/bin/env node
/**
 * Sync experiment UI kit + scaffold each apps/experiments/<slug> as a standalone Next.js app.
 * Run from repo root: pnpm scaffold:experiments
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const experimentsDir = join(root, 'apps/experiments');
const docsDir = join(root, 'apps/docs');
const kitSrc = join(root, 'packages/kit/src');

const NEXT = '16.3.8';
const REACT = '^19.3.0';

/**
 * Opt-in only. Do NOT add a slug here just because the experiment is new.
 * Use API_BACKED when the lab already needs Route Handlers / platform SDKs.
 * Client-only labs (CSP, env inspectors, middleware simulators, etc.) stay out.
 *
 * @type {Record<string, { deps?: Record<string, string>, env?: string[], apiCopies?: Array<{ from: string, to: string }> }>}
 */
const API_BACKED = {
  'webhook-playground': {
    deps: { '@upstash/redis': '^1.39.0', zod: '^4.6.5' },
    env: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    apiCopies: [
      { from: 'app/api/webhooks', to: 'app/api/webhooks' },
    ],
  },
  'og-image-studio': {
    deps: { zod: '^4.6.5' },
    apiCopies: [{ from: 'app/api/og/studio', to: 'app/api/og/studio' }],
  },
  'ai-streaming-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
    apiCopies: [{ from: 'app/api/ai/chat', to: 'app/api/ai/chat' }],
  },
  'cache-behavior-explorer': {
    deps: { zod: '^4.6.5' },
    apiCopies: [{ from: 'app/api/cache-demo', to: 'app/api/cache-demo' }],
  },
  'rate-limiting-simulator': {
    deps: { '@upstash/redis': '^1.39.0', zod: '^4.6.5' },
    env: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    apiCopies: [{ from: 'app/api/rate-limit', to: 'app/api/rate-limit' }],
  },
  'isr-revalidation-playground': {
    deps: { zod: '^4.6.5' },
    apiCopies: [{ from: 'app/api/isr-demo', to: 'app/api/isr-demo' }],
  },
  'ai-code-sandbox': {
    deps: { '@vercel/sandbox': '^3.6.1', zod: '^4.6.5' },
    env: ['SANDBOX_ENABLED'],
    apiCopies: [{ from: 'app/api/sandbox/execute', to: 'app/api/sandbox/execute' }],
  },
  'blob-storage-lab': {
    deps: { '@vercel/blob': '^2.8.1', zod: '^4.6.5' },
    env: ['BLOB_READ_WRITE_TOKEN'],
    apiCopies: [{ from: 'app/api/blob/upload', to: 'app/api/blob/upload' }],
  },
  'global-config-lab': {
    deps: { '@vercel/global-config': '^1.5.1', zod: '^4.6.5' },
    env: ['GLOBAL_CONFIG'],
    apiCopies: [{ from: 'app/api/global-config', to: 'app/api/global-config' }],
  },
  'redis-cache-lab': {
    deps: { '@upstash/redis': '^1.39.0', zod: '^4.6.5' },
    env: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    apiCopies: [
      { from: 'app/api/redis/cache', to: 'app/api/redis/cache' },
      { from: 'app/api/rate-limit', to: 'app/api/rate-limit' },
    ],
  },
  'cron-jobs-lab': {
    deps: { '@upstash/redis': '^1.39.0', '@vercel/blob': '^2.8.1' },
    env: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'CRON_SECRET'],
    apiCopies: [{ from: 'app/api/cron', to: 'app/api/cron' }],
  },
  'neon-postgres-lab': {
    deps: { '@neondatabase/serverless': '^1.2.0', zod: '^4.6.5' },
    env: ['DATABASE_URL'],
    apiCopies: [{ from: 'app/api/postgres/demo', to: 'app/api/postgres/demo' }],
  },
  'workflows-lab': {
    deps: { workflow: '^5.2.0', zod: '^4.6.5' },
  },
  'queues-lab': {
    deps: { '@vercel/queue': '^0.8.0', zod: '^4.6.5' },
  },
  'vercel-flags-lab': {
    deps: {
      flags: '^4.3.1',
      '@flags-sdk/vercel': '^1.5.1',
      '@vercel/flags-core': '^1.10.0',
      zod: '^4.6.5',
    },
  },
  'pdf-quiz-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      unpdf: '^1.4.0',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'receipt-to-json-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'resume-fit-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'url-brief-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'flashcards-from-notes': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'chat-with-your-pdf': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      unpdf: '^1.4.0',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'notes-to-actions-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      '@neondatabase/serverless': '^1.2.0',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL', 'DATABASE_URL'],
  },
  'docs-to-faq-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      '@upstash/redis': '^1.39.0',
    },
    env: [
      'AI_GATEWAY_API_KEY',
      'OPENAI_API_KEY',
      'AI_MODEL',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ],
  },
  'image-alt-studio': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      '@vercel/blob': '^2.8.1',
    },
    env: [
      'AI_GATEWAY_API_KEY',
      'OPENAI_API_KEY',
      'AI_MODEL',
      'BLOB_READ_WRITE_TOKEN',
    ],
  },
  'streaming-ui-checklist': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'og-from-database': {
    deps: {
      '@neondatabase/serverless': '^1.2.0',
      zod: '^4.6.5',
    },
    env: ['DATABASE_URL'],
  },
  'slide-deck-summarizer': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      unpdf: '^1.4.0'
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'csv-insight-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'changelog-from-diff-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'contract-clause-finder': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      unpdf: '^1.4.0',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'invoice-matcher-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'syllabus-planner-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'policy-simplifier-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'codebase-readme-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'schema-from-sample-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'sql-from-question-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      '@neondatabase/serverless': '^1.2.0',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL', 'DATABASE_URL'],
  },
  'api-mock-from-openapi': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'regex-explainer-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'competitor-page-diff': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'rss-digest-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'sitemap-health-lab': {
    deps: { zod: '^4.6.5' },
  },
  'robots-policy-advisor': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'lighthouse-action-plan': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'npm-package-brief': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'github-issue-triage': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'stack-trace-fixer': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'seo-meta-auditor': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'bot-protection-lab': {
    deps: { '@upstash/redis': '^1.39.0', zod: '^4.6.5' },
    env: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  },
  'maintenance-canary-lab': {
    deps: {
      '@upstash/redis': '^1.39.0',
      zod: '^4.6.5',
    },
    env: [
      'MAINTENANCE_MODE',
      'CANARY_PERCENT',
      'GLOBAL_CONFIG',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ],
  },
  'ab-testing-lab': {
    deps: { '@upstash/redis': '^1.39.0', zod: '^4.6.5' },
    env: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  },
  'edge-auth-lab': {
    deps: { jose: '^6.1.0', zod: '^4.6.5' },
    env: ['JWT_SECRET'],
  },
  'mcp-tools-lab': {
    deps: { zod: '^4.6.5' },
  },
  'draft-mode-cms-lab': {
    deps: { '@vercel/blob': '^2.8.1', zod: '^4.6.5' },
    env: ['BLOB_READ_WRITE_TOKEN'],
  },
  'form-to-crm-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      '@neondatabase/serverless': '^1.2.0',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL', 'DATABASE_URL'],
  },
  'inbox-digest-cron': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      '@upstash/redis': '^1.39.0'
    },
    env: [
      'AI_GATEWAY_API_KEY',
      'OPENAI_API_KEY',
      'AI_MODEL',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'CRON_SECRET',
    ],
  },
  'ab-landing-copy-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      '@upstash/redis': '^1.39.0',
    },
    env: [
      'AI_GATEWAY_API_KEY',
      'OPENAI_API_KEY',
      'AI_MODEL',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ],
  },
  'status-page-lab': {
    deps: { '@upstash/redis': '^1.39.0' },
    env: [
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'CRON_SECRET',
      'STATUS_CHECK_URL',
    ],
  },
  'cost-aware-ai-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91'
    },
    env: [
      'AI_GATEWAY_API_KEY',
      'OPENAI_API_KEY',
      'AI_MODEL',
      'AI_MODEL_A',
      'AI_MODEL_B',
    ],
  },
  'support-triage-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      '@upstash/redis': '^1.39.0',
    },
    env: [
      'AI_GATEWAY_API_KEY',
      'OPENAI_API_KEY',
      'AI_MODEL',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ],
  },
  'link-preview-enricher': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      '@vercel/blob': '^2.8.1',
      next: '16.3.8',
    },
    env: [
      'AI_GATEWAY_API_KEY',
      'OPENAI_API_KEY',
      'AI_MODEL',
      'BLOB_READ_WRITE_TOKEN',
    ],
  },
  'memory-thread-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      '@upstash/redis': '^1.39.0'
    },
    env: [
      'AI_GATEWAY_API_KEY',
      'OPENAI_API_KEY',
      'AI_MODEL',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ],
  },
  'waitlist-viral-lab': {
    deps: {
      '@neondatabase/serverless': '^1.2.0'
    },
    env: ['DATABASE_URL', 'CRON_SECRET'],
  },
  'job-queue-lite': {
    deps: { '@upstash/redis': '^1.39.0' },
    env: [
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'CRON_SECRET',
    ],
  },
  'stripe-events-sandbox': {
    deps: { '@upstash/redis': '^1.39.0' },
    env: [
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'STRIPE_WEBHOOK_SECRET',
    ],
  },
  'voice-notes-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'tutor-chat-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91'
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'recipe-from-fridge': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'itinerary-builder': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'budget-split-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'habit-tracker-lite': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      '@upstash/redis': '^1.39.0',
    },
    env: [
      'AI_GATEWAY_API_KEY',
      'OPENAI_API_KEY',
      'AI_MODEL',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ],
  },
  'newsletter-remix': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'price-watch-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      '@upstash/redis': '^1.39.0',
    },
    env: [
      'AI_GATEWAY_API_KEY',
      'OPENAI_API_KEY',
      'AI_MODEL',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ],
  },
  'glossary-builder': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'rfc-writer-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'postmortem-generator': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'onboarding-checklist-ai': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
      '@neondatabase/serverless': '^1.2.0',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL', 'DATABASE_URL'],
  },
  'competitor-battlecard': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'customer-voice-themes': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'okrs-from-strategy': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'meeting-agenda-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'legal-hold-notice': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'accessibility-copy-fix': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'i18n-string-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'email-sequence-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'pitch-deck-outline': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'tool-calling-weather-demo': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'human-in-the-loop-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'rag-from-markdown': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'json-repair-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91'
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'prompt-ab-eval': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'guardrails-lab': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      '@upstash/redis': '^1.39.0'
    },
    env: [
      'AI_GATEWAY_API_KEY',
      'OPENAI_API_KEY',
      'AI_MODEL',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ],
  },
  'structured-form-filler': {
    deps: {
      ai: '^7.0.137',
      '@ai-sdk/openai': '^4.0.91',
      zod: '^4.6.5',
    },
    env: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL'],
  },
  'stale-while-revalidate-shop': {
    deps: { '@upstash/redis': '^1.39.0' },
    env: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  },
  'cron-sitemap-rebuild': {
    deps: {
      '@upstash/redis': '^1.39.0',
      '@vercel/blob': '^2.8.1',
      '@neondatabase/serverless': '^1.2.0'
    },
    env: [
      'CRON_SECRET',
      'DATABASE_URL',
      'BLOB_READ_WRITE_TOKEN',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ],
  },
  'feature-request-board': {
    deps: {
      "ai": "^7.0.137",
      "@ai-sdk/openai": "^4.0.91",
      "@upstash/redis": "^1.39.0",
      "zod": "^4.6.5"
    },
    env: ["AI_GATEWAY_API_KEY", "OPENAI_API_KEY", "AI_MODEL", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  },
  'approval-workflow-lab': {
    deps: {
      "@neondatabase/serverless": "^1.2.0"
    },
    env: ["DATABASE_URL"],
  },
  'multi-tenant-notes': {
    deps: {
      "@neondatabase/serverless": "^1.2.0"
    },
    env: ["DATABASE_URL"],
  },
  'webhook-to-sheet-lab': {
    deps: {
      "@upstash/redis": "^1.39.0"
    },
    env: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  },
  'auth-gated-preview': {
    env: ["PREVIEW_PASSWORD"],
  },
  'invite-only-beta': {
    deps: {
      "@upstash/redis": "^1.39.0"
    },
    env: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  },
  'usage-meter-lab': {
    deps: {
      "@upstash/redis": "^1.39.0"
    },
    env: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  },
  'screenshot-to-ticket': {
    deps: {
      "ai": "^7.0.137",
      "@ai-sdk/openai": "^4.0.91",
      "zod": "^4.6.5"
    },
    env: ["AI_GATEWAY_API_KEY", "OPENAI_API_KEY", "AI_MODEL"],
  },
  'whiteboard-to-tasks': {
    deps: {
      "ai": "^7.0.137",
      "@ai-sdk/openai": "^4.0.91",
      "zod": "^4.6.5"
    },
    env: ["AI_GATEWAY_API_KEY", "OPENAI_API_KEY", "AI_MODEL"],
  },
  'product-shot-copy': {
    deps: {
      "ai": "^7.0.137",
      "@ai-sdk/openai": "^4.0.91",
      "zod": "^4.6.5"
    },
    env: ["AI_GATEWAY_API_KEY", "OPENAI_API_KEY", "AI_MODEL"],
  },
  'before-after-diff-lab': {
    deps: {
      "ai": "^7.0.137",
      "@ai-sdk/openai": "^4.0.91",
      "zod": "^4.6.5"
    },
    env: ["AI_GATEWAY_API_KEY", "OPENAI_API_KEY", "AI_MODEL"],
  },
  'diagram-to-mermaid': {
    deps: {
      "ai": "^7.0.137",
      "@ai-sdk/openai": "^4.0.91",
      "zod": "^4.6.5"
    },
    env: ["AI_GATEWAY_API_KEY", "OPENAI_API_KEY", "AI_MODEL"],
  },
  'pdf-redaction-helper': {
    deps: {
      "ai": "^7.0.137",
      "@ai-sdk/openai": "^4.0.91",
      "zod": "^4.6.5"
    },
    env: ["AI_GATEWAY_API_KEY", "OPENAI_API_KEY", "AI_MODEL"],
  },
};

const BASE_DEPS = {
  next: NEXT,
  react: REACT,
  'react-dom': REACT,
  'class-variance-authority': '^0.7.1',
  clsx: '^2.1.1',
  'lucide-react': '^1.50.0',
  'radix-ui': '^1.7.0',
  'tailwind-merge': '^3.7.0',
  'tw-animate-css': '^1.4.0',
  shadcn: '^4.21.4',
};

const BASE_DEV_DEPS = {
  '@tailwindcss/postcss': '^4.3.3',
  '@types/node': '^26.6.4',
  '@types/react': '^19.3.0',
  '@types/react-dom': '^19.3.0',
  postcss: '^8.5.28',
  tailwindcss: '^4.3.3',
  typescript: '^5.9.3',
};

const GLOBAL_CSS = `@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.488 0.217 264);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}
`;

function listSlugs() {
  return readdirSync(experimentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && d.name !== 'node_modules')
    .map((d) => d.name)
    .sort();
}

function rewriteDemoImports(demoPath) {
  let src = readFileSync(demoPath, 'utf8');
  const map = [
    ["@/components/demo-shell", './ui/demo-shell'],
    ["@/components/copy-button", './ui/copy-button'],
    ["@/components/field", './ui/field'],
    ["@/components/ui/button", './ui/button'],
    ["@/components/ui/checkbox", './ui/checkbox'],
    ["@/components/ui/input", './ui/input'],
    ["@/components/ui/label", './ui/label'],
    ["@/components/ui/select", './ui/select'],
    ["@/components/ui/slider", './ui/slider'],
    ["@/components/ui/switch", './ui/switch'],
    ["@/components/ui/textarea", './ui/textarea'],
    ["@/lib/utils", './ui/utils'],
  ];
  for (const [from, to] of map) {
    src = src.replaceAll(`from '${from}'`, `from '${to}'`);
    src = src.replaceAll(`from "${from}"`, `from "${to}"`);
  }
  writeFileSync(demoPath, src);
}

function rewriteFileImports(filePath, replacements) {
  if (!existsSync(filePath)) return;
  let src = readFileSync(filePath, 'utf8');
  for (const [from, to] of replacements) {
    src = src.replaceAll(from, to);
  }
  writeFileSync(filePath, src);
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function scaffold(slug) {
  const dir = join(experimentsDir, slug);
  const demoPath = join(dir, 'demo.tsx');
  if (!existsSync(demoPath)) {
    console.warn(`skip ${slug}: no demo.tsx`);
    return;
  }

  const uiDir = join(dir, 'ui');
  rmSync(uiDir, { recursive: true, force: true });
  cpSync(kitSrc, uiDir, { recursive: true });
  rewriteDemoImports(demoPath);

  const meta = API_BACKED[slug] ?? {};
  const deps = { ...BASE_DEPS, ...(meta.deps ?? {}) };
  const pkg = {
    name: `@experiments/${slug}`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'next dev --port 3010',
      build: 'next build',
      start: 'next start',
      'types:check': 'next typegen && tsc --noEmit',
    },
    dependencies: deps,
    devDependencies: BASE_DEV_DEPS,
    engines: { node: '>=22' },
    packageManager: 'pnpm@10.12.1',
  };
  writeJson(join(dir, 'package.json'), pkg);

  writeFileSync(
    join(dir, 'next.config.mjs'),
    `/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['radix-ui'],
  },
};

export default config;
`,
  );

  writeFileSync(
    join(dir, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ESNext',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'react-jsx',
          incremental: true,
          paths: { '@/*': ['./*'] },
          plugins: [{ name: 'next' }],
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules', '**/*.test.ts'],
      },
      null,
      2,
    )}\n`,
  );

  writeFileSync(
    join(dir, 'postcss.config.mjs'),
    `const config = { plugins: { '@tailwindcss/postcss': {} } };\nexport default config;\n`,
  );

  mkdirSync(join(dir, 'app'), { recursive: true });
  writeFileSync(join(dir, 'app', 'globals.css'), GLOBAL_CSS);
  writeFileSync(
    join(dir, 'app', 'layout.tsx'),
    `import type { Metadata } from 'next';\nimport type { ReactNode } from 'react';\nimport './globals.css';\n\nexport const metadata: Metadata = {\n  title: '${slug}',\n  description: 'Standalone Vercel experiment: ${slug}',\n};\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="en">\n      <body className="min-h-dvh antialiased">\n        <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>\n      </body>\n    </html>\n  );\n}\n`,
  );
  writeFileSync(
    join(dir, 'app', 'page.tsx'),
    `import Demo from '../demo';\n\nexport default function Page() {\n  return <Demo />;\n}\n`,
  );

  const envLines = [
    '# Public site URL (optional)',
    'NEXT_PUBLIC_SITE_URL=http://localhost:3010',
    ...(meta.env ?? []).map((name) => `${name}=`),
  ];
  writeFileSync(join(dir, '.env.example'), `${envLines.join('\n')}\n`);

  writeFileSync(
    join(dir, 'README.md'),
    `# ${slug}\n\nStandalone experiment from [vercel-experiments.com](https://github.com/vercel-experiments/vercel-experiments.com).\n\n\`\`\`bash\npnpm install\npnpm dev\n\`\`\`\n\nOpen http://localhost:3010\n`,
  );

  if (slug === 'cron-jobs-lab') {
    writeJson(join(dir, 'vercel.json'), {
      crons: [{ path: '/api/cron/heartbeat', schedule: '0 * * * *' }],
    });
  }

  if (slug === 'inbox-digest-cron') {
    writeJson(join(dir, 'vercel.json'), {
      crons: [{ path: '/api/digest', schedule: '0 8 * * *' }],
    });
  }

  if (slug === 'status-page-lab') {
    writeJson(join(dir, 'vercel.json'), {
      crons: [{ path: '/api/check', schedule: '*/15 * * * *' }],
    });
  }

  if (slug === 'cron-sitemap-rebuild') {
    writeJson(join(dir, 'vercel.json'), {
      crons: [{ path: '/api/cron/sitemap', schedule: '0 */6 * * *' }],
    });
  }

  if (slug === 'waitlist-viral-lab') {
    writeJson(join(dir, 'vercel.json'), {
      crons: [{ path: '/api/drip', schedule: '0 9 * * *' }],
    });
  }

  if (slug === 'job-queue-lite') {
    writeJson(join(dir, 'vercel.json'), {
      crons: [{ path: '/api/drain', schedule: '*/5 * * * *' }],
    });
  }

  if (slug === 'queues-lab') {
    writeJson(join(dir, 'vercel.json'), {
      functions: {
        'app/api/queues/fulfill/route.ts': {
          experimentalTriggers: [
            { type: 'queue/v2beta', topic: 'experiments-orders' },
          ],
        },
      },
    });
  }

  // Workflows lab keeps a custom next.config that wraps withWorkflow().
  if (slug === 'workflows-lab') {
    writeFileSync(
      join(dir, 'next.config.mjs'),
      `import { withWorkflow } from 'workflow/next';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['radix-ui'],
  },
};

export default withWorkflow(config);
`,
    );
  }

  for (const copy of meta.apiCopies ?? []) {
    const to = join(dir, copy.to);
    // Experiments own API handlers; hub only re-exports them. Never overwrite.
    if (existsSync(to)) continue;
    const from = join(docsDir, copy.from);
    if (!existsSync(from)) continue;
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to, { recursive: true });
  }

  // Fix imports inside copied API / lib files for this experiment
  const importFixes = [
    [
      "from '@/lib/vercel/redis'",
      "from '@/lib/redis'",
    ],
    [
      'from "@/lib/vercel/redis"',
      'from "@/lib/redis"',
    ],
    [
      "from '@/lib/vercel/services'",
      "from '@/lib/services'",
    ],
    [
      "from '@/lib/vercel/postgres'",
      "from '@/lib/postgres'",
    ],
    [
      "from '@/lib/webhooks/store'",
      "from '@/lib/webhooks-store'",
    ],
    [
      `from '@/experiments/${slug}/logic'`,
      "from '@/logic'",
    ],
    [
      `from "@/experiments/${slug}/logic"`,
      'from "@/logic"',
    ],
  ];

  // webhook store special case after copy
  const storePath = join(dir, 'lib/webhooks-store.ts');
  if (existsSync(storePath)) {
    rewriteFileImports(storePath, [
      [
        "from '@/experiments/webhook-playground/logic'",
        "from '@/logic'",
      ],
      ["from '@/lib/vercel/redis'", "from '@/lib/redis'"],
      [
        "from '../../experiments/webhook-playground/logic'",
        "from '@/logic'",
      ],
      ["from './redis'", "from '@/lib/redis'"],
    ]);
  }

  function walk(dirPath) {
    if (!existsSync(dirPath)) return;
    for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
      const p = join(dirPath, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(entry.name)) rewriteFileImports(p, importFixes);
    }
  }
  walk(join(dir, 'app/api'));
  walk(join(dir, 'lib'));

  console.log(`scaffolded ${slug}`);
}

for (const slug of listSlugs()) {
  scaffold(slug);
}

console.log('done');
