import { describe, expect, it } from 'vitest';
import { clampReadme, toMarkdown, truncateText, type ReadmeDraft } from './logic';

describe('codebase-readme-lab logic', () => {
  it('truncates source', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('12345', 3)).toBe('123');
  });

  it('clamps and renders markdown', () => {
    const draft: ReadmeDraft = {
      title: ' Demo ',
      overview: ' Ov ',
      features: [' a ', '', 'b'],
      gettingStarted: 'gs',
      projectStructure: 'ps',
      configuration: 'cfg',
      scripts: [' pnpm dev '],
    };
    const clamped = clampReadme(draft);
    expect(clamped.title).toBe('Demo');
    expect(clamped.features).toEqual(['a', 'b']);
    const md = toMarkdown(clamped);
    expect(md).toContain('# Demo');
    expect(md).toContain('- a');
    expect(md).toContain('`pnpm dev`');
  });
});
