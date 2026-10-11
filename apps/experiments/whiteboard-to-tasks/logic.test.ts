import { describe, expect, it } from 'vitest';
import { clampTasks, isImageFilename } from './logic';

describe('whiteboard-to-tasks logic', () => {
  it('validates image names', () => {
    expect(isImageFilename('board.jpg')).toBe(true);
  });
  it('clamps tasks', () => {
    const out = clampTasks([{ title: '  Do  ', priority: 'nope' as 'low', owner: ' Ada ' }]);
    expect(out[0]?.title).toBe('Do');
    expect(out[0]?.priority).toBe('medium');
    expect(out[0]?.owner).toBe('Ada');
  });
});
