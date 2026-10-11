export type ContentView = {
  mode: 'published' | 'preview';
  title: string;
  body: string;
};

export const PUBLISHED = {
  title: 'Launch day',
  body: 'Public copy: we shipped the waitlist. Details coming soon.',
};

export const DRAFT = {
  title: 'Launch day (draft)',
  body: 'Preview-only: pricing table + partner logos still under NDA.',
};

export function expectedPassword(): string {
  return process.env.PREVIEW_PASSWORD?.trim() || 'preview';
}

export function checkPassword(input: string): boolean {
  return input.trim() === expectedPassword();
}

export function contentFor(unlocked: boolean): ContentView {
  if (unlocked) return { mode: 'preview', ...DRAFT };
  return { mode: 'published', ...PUBLISHED };
}

export const COOKIE = 've-preview';
