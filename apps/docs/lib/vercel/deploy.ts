const REPO_URL = 'https://github.com/vercel-experiments/vercel-experiments.com';

export type DeployStore =
  | { type: 'blob'; access?: 'public' | 'private'; envVarPrefix?: string }
  | {
    type: 'integration';
    integrationSlug: string;
    productSlug: string;
    protocol?: string;
    envVarPrefix?: string;
    allowConnectExistingProduct?: boolean;
  };

/**
 * Stores for the site-wide Deploy button.
 * The hub is a static catalog - experiment demos provision their own stores
 * via `experimentDeployUrl`. Keep this empty unless the docs app itself needs a store.
 */
export const PLATFORM_DEPLOY_STORES: DeployStore[] = [];

export const BLOB_STORE: DeployStore = { type: 'blob', access: 'public' };

export const REDIS_STORE: DeployStore = {
  type: 'integration',
  integrationSlug: 'upstash',
  productSlug: 'redis',
  protocol: 'storage',
};

export const NEON_STORE: DeployStore = {
  type: 'integration',
  integrationSlug: 'neon',
  productSlug: 'neon',
  protocol: 'storage',
};

type BuildDeployUrlOptions = {
  /** Experiment slug - deploys `apps/experiments/<slug>` as a standalone project. */
  experimentSlug?: string;
  stores?: DeployStore[];
  env?: string[];
  projectName?: string;
  repositoryName?: string;
};

/**
 * Build a Vercel Deploy Button URL that clones this repo (or a single experiment
 * folder) and optionally provisions Marketplace / Blob stores in one click.
 */
export function buildDeployUrl(options: BuildDeployUrlOptions = {}): string {
  const params = new URLSearchParams();
  const slug = options.experimentSlug;
  const repositoryUrl = slug
    ? `${REPO_URL}/tree/main/apps/experiments/${slug}`
    : REPO_URL;

  params.set('repository-url', repositoryUrl);
  params.set(
    'project-name',
    options.projectName ?? (slug ? `ve-${slug}` : 'vercel-experiments'),
  );
  params.set(
    'repository-name',
    options.repositoryName ?? (slug ? `ve-${slug}` : 'vercel-experiments'),
  );

  if (!slug) {
    // Hub lives at apps/docs in the monorepo.
    params.set('root-directory', 'apps/docs');
  }

  if (options.stores?.length) {
    params.set('stores', JSON.stringify(options.stores));
  }

  if (options.env?.length) {
    params.set('env', options.env.join(','));
    params.set(
      'envDescription',
      'Optional secrets for this experiment. Marketplace stores inject their own credentials.',
    );
  }

  return `https://vercel.com/new/clone?${params.toString()}`;
}

/** Deploy a single standalone experiment folder. */
export function experimentDeployUrl(
  slug: string,
  options: Omit<BuildDeployUrlOptions, 'experimentSlug'> = {},
): string {
  return buildDeployUrl({ ...options, experimentSlug: slug });
}

export const platformDeployUrl = buildDeployUrl({
  ...(PLATFORM_DEPLOY_STORES.length > 0
    ? { stores: PLATFORM_DEPLOY_STORES }
    : {}),
  env: ['NEXT_PUBLIC_SITE_URL'],
});
