export const MAX_UPLOAD_BYTES = 256 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function isAllowedFilename(name: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(name) && name.length > 0 && name.length <= 80;
}

export function blobSetupSnippet(): string {
  return `import { put } from '@vercel/blob';

const blob = await put('uploads/hello.txt', 'hello', {
  access: 'public',
});

console.log(blob.url);`;
}
