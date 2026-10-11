import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));
const experimentsRoot = path.join(root, '../experiments');

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\/experiments\/(.*)/,
        replacement: `${experimentsRoot}/$1`,
      },
      { find: '@', replacement: root },
    ],
  },
  test: {
    include: [
      '../experiments/**/logic.test.ts',
      'lib/**/*.test.ts',
    ],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
