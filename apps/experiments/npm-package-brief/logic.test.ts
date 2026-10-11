import { describe, expect, it } from 'vitest';
import {
  clampBrief,
  normalizePackageName,
  parseRegistryPackage,
  registryPackageUrl,
} from './logic';

describe('npm-package-brief logic', () => {
  it('normalizes package names', () => {
    expect(normalizePackageName(' Zod ')).toBe('zod');
    expect(normalizePackageName('@scope/pkg')).toBe('@scope/pkg');
    expect(normalizePackageName('../evil')).toBeNull();
  });

  it('parses registry payload and clamps brief', () => {
    const meta = parseRegistryPackage({
      name: 'zod',
      'dist-tags': { latest: '3.0.0' },
      versions: {
        '3.0.0': {
          description: 'schema',
          license: 'MIT',
          homepage: 'https://zod.dev',
          keywords: ['validation'],
          repository: { url: 'git+https://github.com/colinhacks/zod.git' },
        },
      },
    });
    expect(meta?.version).toBe('3.0.0');
    expect(meta?.repository).toContain('github.com');
    expect(registryPackageUrl('zod')).toContain('registry.npmjs.org/zod');
    expect(
      clampBrief({
        whenToUse: ['a', ''],
        whenToAvoid: Array.from({ length: 10 }, (_, i) => `x${i}`),
        notes: ['n'],
      }).whenToAvoid,
    ).toHaveLength(6);
  });
});
