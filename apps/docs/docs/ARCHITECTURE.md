# Architecture

## Stack

- Next.js App Router 16
- Fumadocs MDX/UI for documentation
- Tailwind CSS 4 with Fumadocs neutral tokens
- Zod-validated static experiment registry
- Vitest for unit tests, Playwright for e2e
- pnpm workspace monorepo (`apps/*`, `packages/*`)

## Repository layout

```
apps/docs                 # Hub (@ve/docs)
apps/experiments/<slug>   # Standalone experiment apps
packages/kit              # Shared experiment UI source
```

## Experiment system

1. Metadata lives in `apps/docs/lib/experiments/data.ts` and is validated by Zod.
2. Interactive implementations live under `apps/experiments/<slug>/` as standalone Next.js apps.
3. Docs pages point people to **Deploy on Vercel** or local `pnpm dev` - demos are not embedded on the hub.
4. Unpublished experiments are excluded from public getters, sitemap, and navigation.

## Content vs demos

- Explanatory content: `apps/docs/content/docs/**`
- Interactive implementations: `apps/experiments/**`
- MDX `<ExperimentEmbed slug="..." />` shows a deploy / run-locally launch panel

## Vercel services

Standalone experiment apps detect Marketplace / native credentials at runtime when deployed:

| Service       | Package / API              | Env                     |
| ------------- | -------------------------- | ----------------------- |
| AI Gateway    | AI SDK model strings       | `AI_GATEWAY_API_KEY`    |
| Blob          | `@vercel/blob`             | `BLOB_READ_WRITE_TOKEN` |
| Global Config | `@vercel/global-config`    | `GLOBAL_CONFIG`         |
| Redis         | `@upstash/redis`           | `UPSTASH_REDIS_REST_*`  |
| Postgres      | `@neondatabase/serverless` | `DATABASE_URL`          |
| Sandbox       | `@vercel/sandbox`          | `SANDBOX_ENABLED`       |
| Cron          | `vercel.json` crons        | optional `CRON_SECRET`  |

One-click Deploy URLs are built in `apps/docs/lib/vercel/deploy.ts` using the `stores` parameter. Hub deploys set `root-directory=apps/docs`.

## Security posture

- No open proxies
- Webhook capture is TTL/size/rate limited with header redaction
- AI keys remain server-side
- Simulations are labeled when live infrastructure is unavailable
- Sandbox never evals user JS in the Next.js process
