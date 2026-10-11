import { describe, expect, it } from 'vitest';
import { parseFrontmatterTitle, slugify } from './logic';

describe('draft-mode-cms-lab', () => {
  it('parses title from markdown heading', () => {
    expect(parseFrontmatterTitle('# Hello World\n\nBody')).toBe('Hello World');
  });

  it('slugifies titles', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
  });
});
