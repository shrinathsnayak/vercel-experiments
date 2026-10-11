import { describe, expect, it } from 'vitest';
import { clampPlan, MAX_WEEKS, truncateText, type StudyPlan } from './logic';

describe('syllabus-planner-lab logic', () => {
  it('truncates syllabus', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('abcdefghij', 4)).toBe('abcd');
  });

  it('clamps weeks and hours', () => {
    const plan: StudyPlan = {
      courseTitle: ' Demo ',
      tips: [' a ', '', 'b'],
      weeks: Array.from({ length: MAX_WEEKS + 2 }, (_, i) => ({
        week: i + 1,
        focus: ` f${i} `,
        topics: [' t '],
        tasks: [' task '],
        estimatedHours: 99,
      })),
    };
    const clamped = clampPlan(plan);
    expect(clamped.courseTitle).toBe('Demo');
    expect(clamped.weeks).toHaveLength(MAX_WEEKS);
    expect(clamped.weeks[0].estimatedHours).toBe(40);
    expect(clamped.tips).toEqual(['a', 'b']);
  });
});
