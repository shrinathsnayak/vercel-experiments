import { describe, expect, it } from 'vitest';
import { mergePartialChecklist, truncateText } from './logic';

describe('streaming-ui-checklist logic', () => {
  it('truncates prompts', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(20), 5).length).toBe(5);
  });

  it('merges partial checklist items', () => {
    expect(mergePartialChecklist(null)).toEqual([]);
    expect(
      mergePartialChecklist({
        items: [{ title: ' A ' }, { title: '' }, { title: 'B', detail: ' d ' }],
      }),
    ).toEqual([
      { title: 'A' },
      { title: 'B', detail: 'd' },
    ]);
  });
});
