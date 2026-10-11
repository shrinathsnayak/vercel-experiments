import { describe, expect, it } from 'vitest';
import {
  isTextLikeFilename,
  scoreQuiz,
  truncateText,
  MAX_TEXT_CHARS,
  type QuizQuestion,
} from './logic';

const q: QuizQuestion = {
  question: 'Q?',
  choices: ['a', 'b', 'c', 'd'],
  correctIndex: 1,
  explanation: 'b',
};

describe('pdf-quiz-lab logic', () => {
  it('truncates long text', () => {
    const long = 'x'.repeat(MAX_TEXT_CHARS + 50);
    expect(truncateText(long).length).toBe(MAX_TEXT_CHARS);
  });

  it('accepts text-like filenames', () => {
    expect(isTextLikeFilename('notes.pdf')).toBe(true);
    expect(isTextLikeFilename('notes.md')).toBe(true);
    expect(isTextLikeFilename('pic.png')).toBe(false);
  });

  it('scores quiz answers', () => {
    const result = scoreQuiz([1, 0], [q, { ...q, correctIndex: 2 }]);
    expect(result.correct).toBe(1);
    expect(result.total).toBe(2);
    expect(result.detail).toEqual([true, false]);
  });
});
