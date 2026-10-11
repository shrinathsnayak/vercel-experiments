import { describe, expect, it } from 'vitest';
import { isImageFilename, sanitizeSeoFilename } from './logic';

describe('image-alt-studio logic', () => {
  it('detects image filenames', () => {
    expect(isImageFilename('photo.PNG')).toBe(true);
    expect(isImageFilename('notes.pdf')).toBe(false);
  });

  it('sanitizes SEO filenames', () => {
    expect(sanitizeSeoFilename('My Cool Photo!!.JPG')).toBe('my-cool-photo');
    expect(sanitizeSeoFilename('@@@.png')).toBe('image');
  });
});
