export type FlagValueType = 'boolean' | 'string' | 'number';

export type FlagEntity = {
  user?: {
    id: string;
    email?: string;
    plan?: string;
  };
  team?: {
    id: string;
    name?: string;
  };
};

export type LocalFlagDefinition = {
  key: string;
  type: FlagValueType;
  /** Default when no targeting rule matches. */
  defaultValue: boolean | string | number;
  enabled: boolean;
  /** 0–100 sticky rollout when type is boolean and enabled. */
  rolloutPercent: number;
  /** Force treatment for these plans. */
  plans: string[];
};

export type LocalFlagResult = {
  key: string;
  value: boolean | string | number;
  reason: string;
  bucket: number;
  source: 'local-simulator';
};

/** Deterministic 0–99 bucket (FNV-1a) - sticky per flag key + user id. */
export function hashBucket(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 100;
}

/**
 * Local evaluator that mirrors Vercel Flags concepts: entities, plan targeting,
 * and sticky percentage rollouts. Live mode uses @flags-sdk/vercel / flagsClient.
 */
export function evaluateLocalFlag(
  definition: LocalFlagDefinition,
  entities: FlagEntity,
): LocalFlagResult {
  const userId = entities.user?.id ?? 'anonymous';
  const bucket = hashBucket(`${definition.key}:${userId}`);

  if (!definition.enabled) {
    return {
      key: definition.key,
      value: definition.type === 'boolean' ? false : definition.defaultValue,
      reason: 'Flag disabled - returning default / off.',
      bucket,
      source: 'local-simulator',
    };
  }

  const plan = entities.user?.plan;
  if (plan && definition.plans.includes(plan)) {
    const value =
      definition.type === 'boolean'
        ? true
        : definition.type === 'string'
          ? 'treatment'
          : definition.defaultValue;
    return {
      key: definition.key,
      value,
      reason: `Entity rule matched user.plan=${plan}.`,
      bucket,
      source: 'local-simulator',
    };
  }

  if (definition.type === 'boolean') {
    const on = bucket < definition.rolloutPercent;
    return {
      key: definition.key,
      value: on,
      reason: on
        ? `Bucket ${bucket} < rollout ${definition.rolloutPercent}% - enabled (sticky).`
        : `Bucket ${bucket} ≥ rollout ${definition.rolloutPercent}% - default off (sticky).`,
      bucket,
      source: 'local-simulator',
    };
  }

  return {
    key: definition.key,
    value: definition.defaultValue,
    reason: 'No targeting match - returning default value.',
    bucket,
    source: 'local-simulator',
  };
}

export function flagsSdkSnippet(): string {
  return `import { flag } from 'flags/next';
import { vercelAdapter } from '@flags-sdk/vercel';

export const marketingBanner = flag({
  key: 'marketing-banner',
  adapter: vercelAdapter(),
});

// Server Component:
const show = await marketingBanner();`;
}

export const FLAGS_SETUP_REQUIREMENTS = [
  'Create the flag in the Vercel Dashboard (Flags sidebar) for this project.',
  'Run vercel link && vercel env pull so OIDC can authenticate the Flags SDK locally.',
  'Install flags + @flags-sdk/vercel (or evaluate with @vercel/flags-core).',
] as const;

export const DEFAULT_FLAG_KEY = 'marketing-banner';
