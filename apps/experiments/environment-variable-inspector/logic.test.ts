import { describe, expect, it } from 'vitest';
import {
  classifyEnvKey,
  parseEnvFile,
  redactForClient,
} from './logic';

describe('classifyEnvKey', () => {
  it('classifies NEXT_PUBLIC as public', () => {
    expect(classifyEnvKey('NEXT_PUBLIC_API')).toBe('public');
  });

  it('classifies secrets as server', () => {
    expect(classifyEnvKey('DATABASE_URL')).toBe('server');
  });

  it('flags invalid keys', () => {
    expect(classifyEnvKey('bad-key')).toBe('invalid');
  });
});

describe('parseEnvFile', () => {
  it('parses assignments and skips comments', () => {
    const parsed = parseEnvFile(`# comment\nFOO=bar\n`);
    expect(parsed.entries).toEqual([{ key: 'FOO', value: 'bar', line: 2 }]);
  });
});

describe('redactForClient', () => {
  it('hides server values', () => {
    const view = redactForClient([
      { key: 'NEXT_PUBLIC_X', value: 'visible', line: 1 },
      { key: 'SECRET', value: 'hidden', line: 2 },
    ]);
    expect(view.NEXT_PUBLIC_X).toBe('visible');
    expect(view.SECRET).toBe('[REDACTED - server only]');
  });
});
