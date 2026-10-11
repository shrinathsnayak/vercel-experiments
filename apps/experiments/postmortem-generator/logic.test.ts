import { describe, expect, it } from 'vitest';
import { parseTimelineLines } from './logic';
describe('postmortem-generator', () => {
  it('parses timeline', () => {
    expect(parseTimelineLines('14:02 deploy\n14:20 rollback')).toEqual([
      { time: '14:02', event: 'deploy' },
      { time: '14:20', event: 'rollback' },
    ]);
  });
});