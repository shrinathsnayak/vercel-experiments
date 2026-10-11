import { describe, expect, it } from 'vitest';
import {
  clampSchema,
  detectSampleKind,
  truncateText,
  type SchemaOutput,
} from './logic';

describe('schema-from-sample-lab logic', () => {
  it('truncates sample', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('abcdef', 4)).toBe('abcd');
  });

  it('detects json vs csv', () => {
    expect(detectSampleKind('{"a":1}')).toBe('json');
    expect(detectSampleKind('a,b\n1,2')).toBe('csv');
    expect(detectSampleKind('hello')).toBe('unknown');
  });

  it('clamps schema strings', () => {
    const out: SchemaOutput = {
      typescript: ' type X = {} ',
      zod: ' z.object({}) ',
      notes: [' n ', ''],
    };
    const clamped = clampSchema(out);
    expect(clamped.typescript).toBe('type X = {}');
    expect(clamped.zod).toBe('z.object({})');
    expect(clamped.notes).toEqual(['n']);
  });
});
