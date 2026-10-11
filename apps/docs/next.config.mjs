import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();
const appDir = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = join(appDir, '../..');

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
  experimental: {
    optimizePackageImports: ['radix-ui'],
  },
  async redirects() {
    return [
      {
        source: '/changelog',
        destination: '/docs/changelog',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Advertise Accept negotiation for HTML/Markdown dual representations.
        source: '/:path*',
        headers: [{ key: 'Vary', value: 'Accept' }],
      },
    ];
  },
};

export default withMDX(config);
