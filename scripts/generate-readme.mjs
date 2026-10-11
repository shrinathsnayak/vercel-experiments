/**
 * Regenerates README.md experiment tables from apps/docs/lib/experiments/data.ts
 * Run: node scripts/generate-readme.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = join(root, 'apps/docs/lib/experiments/data.ts');
const readmePath = join(root, 'README.md');

const REPO = 'https://github.com/shrinathsnayak/vercel-experiments';
const SITE = 'https://vercel-experiments.com';
const OWNER_REPO = 'shrinathsnayak/vercel-experiments';

const CATEGORY_ORDER = [
  'ai',
  'performance',
  'networking',
  'security',
  'rendering',
  'routing',
  'platform',
  'developer-tools',
];

const CATEGORY_LABELS = {
  ai: 'AI',
  performance: 'Performance',
  networking: 'Networking',
  security: 'Security',
  rendering: 'Rendering',
  routing: 'Routing',
  platform: 'Platform',
  'developer-tools': 'Developer Tools',
};

/** @param {string} slug */
function experimentDeployUrl(slug, options = {}) {
  const params = new URLSearchParams();
  params.set('repository-url', `${REPO}/tree/main/apps/experiments/${slug}`);
  params.set('project-name', `ve-${slug}`);
  params.set('repository-name', `ve-${slug}`);
  if (options.stores?.length) {
    params.set('stores', JSON.stringify(options.stores));
  }
  if (options.env?.length) {
    params.set('env', options.env.join(','));
    params.set(
      'envDescription',
      'Optional secrets for this experiment. Marketplace stores inject their own credentials.',
    );
  }
  return `https://vercel.com/new/clone?${params.toString()}`;
}

function platformDeployUrl() {
  const params = new URLSearchParams();
  params.set('repository-url', REPO);
  params.set('project-name', 'vercel-experiments');
  params.set('repository-name', 'vercel-experiments');
  params.set('root-directory', 'apps/docs');
  params.set('env', 'NEXT_PUBLIC_SITE_URL');
  return `https://vercel.com/new/clone?${params.toString()}`;
}

const STORE = {
  BLOB_STORE: { type: 'blob', access: 'public' },
  REDIS_STORE: {
    type: 'integration',
    integrationSlug: 'upstash',
    productSlug: 'redis',
    protocol: 'storage',
  },
  NEON_STORE: {
    type: 'integration',
    integrationSlug: 'neon',
    productSlug: 'neon',
    protocol: 'storage',
  },
};

function parseExperiments(source) {
  const blocks = source.split(/\n  \{\n/).slice(1);
  /** @type {Array<{slug:string,title:string,description:string,category:string,featured:boolean,published:boolean,deploymentUrl:string}>} */
  const experiments = [];

  for (const block of blocks) {
    const slug = block.match(/slug:\s*'([^']+)'/)?.[1];
    const title = block.match(/title:\s*'([^']+)'/)?.[1];
    const description = block.match(/description:\s*\n?\s*'([^']+)'/)?.[1]
      ?? block.match(/description:\s*'([^']+)'/)?.[1];
    const category = block.match(/category:\s*'([^']+)'/)?.[1];
    const featured = /featured:\s*true/.test(block);
    const published = /published:\s*true/.test(block);
    if (!slug || !title || !description || !category || !published) continue;

    const deployCall = block.match(
      /deploymentUrl:\s*experimentDeployUrl\(\s*'([^']+)'\s*(?:,\s*(\{[\s\S]*?\}))?\s*\)/,
    );
    let deploymentUrl = experimentDeployUrl(slug);
    if (deployCall) {
      const optsSource = deployCall[2] ?? '';
      const stores = [];
      for (const key of Object.keys(STORE)) {
        if (optsSource.includes(key)) stores.push(STORE[key]);
      }
      const envMatch = optsSource.match(/env:\s*\[([^\]]*)\]/);
      const env = envMatch
        ? [...envMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
        : undefined;
      deploymentUrl = experimentDeployUrl(slug, {
        stores: stores.length ? stores : undefined,
        env,
      });
    }

    experiments.push({
      slug,
      title,
      description,
      category,
      featured,
      published,
      deploymentUrl,
    });
  }

  return experiments;
}

function esc(text) {
  return text.replace(/\|/g, '\\|');
}

function row(experiment) {
  const src = `https://github.com/${OWNER_REPO}/tree/main/apps/experiments/${experiment.slug}`;
  const docs = `${SITE}${experiment.documentationPath ?? `/docs/experiments/${experiment.slug}`}`;
  return `| [${esc(experiment.title)}](${src}) | ${esc(experiment.description)} | [Docs](${docs}) · [Deploy](${experiment.deploymentUrl}) |`;
}

function main() {
  const source = readFileSync(dataPath, 'utf8');
  const experiments = parseExperiments(source).map((e) => ({
    ...e,
    documentationPath: `/docs/experiments/${e.slug}`,
  }));

  const byCategory = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, []]));
  for (const experiment of experiments) {
    byCategory[experiment.category]?.push(experiment);
  }
  for (const list of Object.values(byCategory)) {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  const startHere = [
    'ai-streaming-lab',
    'blob-storage-lab',
    'redis-cache-lab',
    'webhook-playground',
    'og-image-studio',
  ]
    .map((slug) => experiments.find((e) => e.slug === slug))
    .filter(Boolean);

  const count = experiments.length;
  const hubDeploy = platformDeployUrl();

  const experimentSections = CATEGORY_ORDER.filter(
    (c) => byCategory[c]?.length,
  )
    .map((category) => {
      const label = CATEGORY_LABELS[category];
      const rows = byCategory[category].map(row).join('\n');
      return `### ${label}\n\n| Experiment | What it shows | Docs / Deploy |\n| --- | --- | --- |\n${rows}`;
    })
    .join('\n\n');

  const startRows = startHere
    .map((e) => {
      const src = `https://github.com/${OWNER_REPO}/tree/main/apps/experiments/${e.slug}`;
      return `| [${esc(e.title)}](${src}) | ${esc(e.description)} | [Deploy on Vercel](${e.deploymentUrl}) |`;
    })
    .join('\n');

  const readme = `# Vercel Experiments

**${count} deployable Next.js / Vercel experiments** - real Route Handlers, tests, API docs, and a one-click Deploy button. Not Hello World demos. Covers AI Gateway, Blob, Redis, Neon, Cron, Queues, Workflows, Flags, ISR, middleware, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Docs](https://img.shields.io/badge/docs-vercel--experiments.com-black)](${SITE}/docs)
[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)

> **Not affiliated with or endorsed by Vercel, Inc.** Independent open-source playground.

**Live site:** [${SITE.replace('https://', '')}](${SITE}) · [Browse experiments](${SITE}/docs) · [Getting started](${SITE}/docs/getting-started)

### Start here

Pick one, clone only that folder, deploy in one click.

| Experiment | What it shows | Deploy |
| --- | --- | --- |
${startRows}

Hub docs live in [\`apps/docs/\`](./apps/docs) (Fumadocs + Next.js). Each lab is a standalone app under [\`apps/experiments/<slug>/\`](./apps/experiments).

[![Deploy hub with Vercel](https://vercel.com/button)](${hubDeploy})

---

## About

Reference implementations for building with **Next.js App Router** and **Vercel platform services**.

Each experiment is:

- **Capability-focused** - one Vercel / Next.js feature (or a small, honest composition)
- **Independently deployable** - Deploy clones \`apps/experiments/<slug>/\` only
- **Honest when unconfigured** - missing Redis / AI / Blob returns a clear \`503\` setup message, not fake success
- **Documented** - MDX API docs on the hub, plus Vitest for non-trivial logic
- **Runnable under a minute** once env / Marketplace stores are ready

---

## Philosophy

Most Next.js samples stop at a counter or a blog. This repo is for **patterns you copy when wiring real platform pieces**: AI Gateway streaming, Blob uploads, Upstash rate limits, Neon inserts, Cron heartbeats, Queues consumers, Workflow steps, Flags evaluation, ISR revalidation, proxy routing, webhook HMAC, and OG \`ImageResponse\` cards.

Demos degrade honestly. If a store or API key is missing, the UI says so - it does not invent results.

---

## Repository structure

\`\`\`
vercel-experiments.com/
├── apps/
│   ├── docs/                 # Catalog + Fumadocs hub (vercel-experiments.com)
│   └── experiments/<slug>/   # ${count} standalone Next.js experiment apps
├── packages/
│   └── kit/                  # Shared experiment UI (synced into each lab)
├── EXPERIMENTS.md            # How to add a new experiment
├── README.md
└── LICENSE
\`\`\`

pnpm workspace. Prefer installing from the repo root so Next.js stays hoisted once.

---

## Experiments

There are **${count}** published experiments, grouped like the docs sidebar. Each row links to source, docs, and a Vercel Deploy Button.

${experimentSections}

Deploy URLs target \`${OWNER_REPO}\`. Fork the repo and swap the owner in the Deploy URL if you want clones from your fork.

---

## Quick start

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

Run a single lab:

\`\`\`bash
cd apps/experiments/ai-streaming-lab
pnpm install
pnpm dev
\`\`\`

| Command | Purpose |
| --- | --- |
| \`pnpm dev\` | Docs hub |
| \`pnpm build\` | Hub production build |
| \`pnpm test\` | Unit tests |
| \`pnpm test:e2e\` | Playwright |
| \`pnpm lint\` / \`pnpm types:check\` | Lint and types |
| \`pnpm run ci\` | Lint, types, tests, build |
| \`pnpm scaffold:experiments\` | Sync \`packages/kit\` into each experiment \`ui/\` |

---

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) and [EXPERIMENTS.md](./EXPERIMENTS.md) for:

- Bug reports and PRs
- Experiment layout (\`demo.tsx\`, \`logic.ts\`, \`app/\`, local \`ui/\`)
- Registry + MDX docs checklist
- Security notes in [SECURITY.md](./SECURITY.md)

By participating, you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md). Keep demos honest about missing configuration - never invent AI output or storage success when a service is absent.

---

## Why this exists

- **Independent deploys** - one lab, one Vercel project, no monorepo lock-in for learners
- **Platform coverage** - AI, storage, data, cron, queues, workflows, flags, edge headers, caching, security
- **Docs hub** - searchable catalog at [${SITE.replace('https://', '')}](${SITE}) with per-experiment API pages
- **Copy-paste ready** - small surface area, real Route Handlers, Zod validation

---

## License

MIT - see [LICENSE](./LICENSE).
`;

  writeFileSync(readmePath, readme);
  console.log(`Wrote ${readmePath} (${count} experiments)`);
}

main();
