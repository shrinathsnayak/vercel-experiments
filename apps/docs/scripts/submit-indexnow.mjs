/**
 * Postbuild IndexNow submission for published experiment docs URLs.
 *
 * Skips when INDEXNOW_KEY is missing or the site URL is localhost so local
 * builds stay quiet. On Vercel, set INDEXNOW_KEY (and optionally INDEXNOW_HOST /
 * NEXT_PUBLIC_SITE_URL).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { notifyBatch } from 'next-indexnow';

const DEFAULT_HOST = 'vercel-experiments.com';

function loadEnvFile(path) {
  try {
    const text = readFileSync(path, 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // optional local env file
  }
}

function publishedExperimentPaths(dataSource) {
  const re = /published:\s*(true|false),[\s\S]*?documentationPath:\s*'([^']+)'/g;
  const paths = [];
  let match;
  while ((match = re.exec(dataSource)) !== null) {
    if (match[1] === 'true') paths.push(match[2]);
  }
  return paths;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
loadEnvFile(join(root, '.env.local'));
loadEnvFile(join(root, '.env'));

const key = process.env.INDEXNOW_KEY?.trim();
const host = (process.env.INDEXNOW_HOST ?? DEFAULT_HOST).replace(/^https?:\/\//, '').replace(/\/$/, '');
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || `https://${host}`
).replace(/\/$/, '');

if (!key) {
  console.log('[indexnow] Skipping: INDEXNOW_KEY not set');
  process.exit(0);
}

if (/localhost|127\.0\.0\.1/i.test(siteUrl)) {
  console.log(`[indexnow] Skipping: site URL is local (${siteUrl})`);
  process.exit(0);
}

const dataSource = readFileSync(join(root, 'lib/experiments/data.ts'), 'utf8');
const urls = publishedExperimentPaths(dataSource).map((path) => `${siteUrl}${path}`);

if (urls.length === 0) {
  console.log('[indexnow] Skipping: no published experiment URLs found');
  process.exit(0);
}

console.log(`[indexnow] Submitting ${urls.length} experiment URLs for ${host}…`);

const result = await notifyBatch(urls, { key, host });

console.log(
  `[indexnow] Submitted ${result.submitted} URLs (skipped ${result.skipped}; ok=${result.ok})`,
);
