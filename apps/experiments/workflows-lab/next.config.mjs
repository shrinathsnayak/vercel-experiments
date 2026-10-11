import { withWorkflow } from 'workflow/next';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['radix-ui'],
  },
};

export default withWorkflow(config);
