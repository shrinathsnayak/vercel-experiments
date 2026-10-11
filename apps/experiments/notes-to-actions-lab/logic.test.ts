import { describe, expect, it } from 'vitest';
import {
  clampActions,
  MAX_ACTIONS,
  toggleStatus,
  truncateText,
} from './logic';

describe('notes-to-actions-lab logic', () => {
  it('truncates notes', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(50), 8).length).toBe(8);
  });

  it('clamps and normalizes actions', () => {
    const items = Array.from({ length: MAX_ACTIONS + 3 }, (_, i) => ({
      id: ` ${i} `,
      title: ` task ${i} `,
      status: 'open' as const,
    }));
    const clamped = clampActions(items);
    expect(clamped).toHaveLength(MAX_ACTIONS);
    expect(clamped[0].title).toBe('task 0');
    expect(clamped[0].id).toBe('0');
  });

  it('toggles status', () => {
    expect(toggleStatus('open')).toBe('done');
    expect(toggleStatus('done')).toBe('open');
  });
});
