import { describe, expect, it } from 'vitest';
import {
  BLOB_STORE,
  buildDeployUrl,
  experimentDeployUrl,
  PLATFORM_DEPLOY_STORES,
  platformDeployUrl,
} from './deploy';

describe('buildDeployUrl', () => {
  it('includes repository and stores', () => {
    const url = buildDeployUrl({ stores: [BLOB_STORE] });
    expect(url).toContain('vercel.com/new/clone');
    expect(url).toContain('repository-url=');
    expect(decodeURIComponent(url)).toContain(
      'https://github.com/shrinathsnayak/vercel-experiments',
    );
    expect(url).toContain('stores=');
    expect(decodeURIComponent(url)).toContain('"type":"blob"');
  });

  it('platform deploy targets the docs hub without experiment stores', () => {
    expect(PLATFORM_DEPLOY_STORES).toHaveLength(0);
    expect(platformDeployUrl).not.toContain('upstash');
    expect(platformDeployUrl).not.toContain('neon');
    expect(platformDeployUrl).not.toContain('stores=');
    expect(decodeURIComponent(platformDeployUrl)).toContain(
      'root-directory=apps/docs',
    );
    expect(platformDeployUrl).toContain('NEXT_PUBLIC_SITE_URL');
  });

  it('experiment deploy points at the experiment folder', () => {
    const url = experimentDeployUrl('webhook-playground', {
      stores: [BLOB_STORE],
    });
    expect(decodeURIComponent(url)).toContain(
      '/tree/main/apps/experiments/webhook-playground',
    );
    expect(url).toContain('project-name=ve-webhook-playground');
  });
});
