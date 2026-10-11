# Adding an experiment

Each experiment is a **standalone Next.js app** under `apps/experiments/<slug>/`, plus registry metadata and docs on the hub (`apps/docs`).

## Repository layout

```
apps/
  docs/                 # Catalog + Fumadocs hub (@ve/docs)
  experiments/<slug>/   # Independently deployable experiment apps
packages/
  kit/                  # Shared experiment UI (synced into each experiment ui/)
```

## 1. Scaffold the app

```
apps/experiments/<slug>/
  package.json      # @experiments/<slug>
  next.config.mjs
  tsconfig.json
  postcss.config.mjs
  .env.example
  README.md
  app/
    layout.tsx
    page.tsx        # renders demo
    globals.css
    api/…           # only when HTTP / secrets / ImageResponse require it
  demo.tsx          # default export (client when interactive)
  logic.ts          # pure functions
  logic.test.ts     # optional but preferred
  ui/               # local copy of the shared experiment kit
  lib/              # experiment-owned helpers (redis, etc.)
```

**Do not add Route Handlers by default.** Prefer page + `logic.ts` unless the lesson needs a server boundary.

| Pattern | Surface |
| --- | --- |
| Middleware / CSP / env inspectors / `next/image` / SSR streaming / client crypto | **UI** - no `app/api` |
| Webhooks, cron, blob, redis, queues, geo headers, OG `ImageResponse`, AI keys | **Route Handlers** (or Server Actions for form-style demos) |
| Documented REST / HTTP product API | Only when the experiment is *about* HTTP (webhook playground, MCP, cache headers) |

Copy an existing client-only lab (for example `content-security-policy-builder`) or re-run:

```bash
pnpm scaffold:experiments
```

That script syncs `packages/kit` into each experiment's `ui/` folder. Prefer editing the kit source, then re-sync.

Demo imports should be relative (`./ui/button`, `./logic`), never `@/components/*` from the hub.

## 2. Register metadata

Add a validated entry to `apps/docs/lib/experiments/data.ts`.

Set `deploymentUrl: experimentDeployUrl('<slug>', { stores?, env? })` so one-click deploy clones only this folder.

Set `published: false` while drafting.

## 3. Document it

Create `apps/docs/content/docs/experiments/<slug>.mdx`. Aim for the depth of existing Phase 4 labs: read the code first, show real excerpts, and never invent APIs or limits.

Add the experiment (with a docs link) under the latest date in `apps/docs/content/docs/changelog.mdx`.

Front matter `title` and `description` must match `apps/docs/lib/experiments/data.ts`. Then:

```mdx
<ExperimentEmbed slug="your-slug" />

<Callout type="warning">
  This is an experimental demo. Use it as a starting point for your own
  projects.
</Callout>

Intro paragraph.
```

`<ExperimentEmbed>` renders a deploy / run-locally panel on the hub - demos are not embedded in the catalog site.

Follow with these sections, in order:

1. **Features**
2. **UI Reference** (default) - controls, local helpers, and what the demo does in-browser. Use **API Reference** only when `app/api` is a real HTTP teaching surface. Use **Server Reference** for AI / secret-backed handlers that exist for safety, not as a public REST product. Mixed labs may include both (UI first, then API/Server).
3. **Implementation Details**
4. **Use Cases**
5. **Limitations**
6. **Use in your project**
7. **Deployment** - `<ExperimentDeployButton slug="..." />` plus notes / `experimentDeployUrl`
8. **Local Development** - `cd apps/experiments/<slug> && pnpm install && pnpm dev`
9. **Configuration**
10. **Vercel / Next.js Features Used**
11. **Next Steps**

Registry `surface` is `ui` | `route-handlers` | `mixed` (derived in `apps/docs/lib/experiments/registry.ts`; override per entry when needed).

## 4. APIs stay in the experiment app

Route Handlers live only under `apps/experiments/<slug>/app/api/...` when the experiment needs them. The docs hub (`apps/docs`) is a static catalog - it does **not** re-export experiment APIs. Deploy or run the experiment folder to exercise handlers. Scaffolding never invents `/api` stubs for new slugs - opt into `API_BACKED` only for labs that already need handlers.

When developing an experiment locally (`cd apps/experiments/<slug> && pnpm install`), remove that folder's `node_modules` before running the hub `pnpm build` - nested `next` installs create duplicate type identities that break the hub typecheck. Prefer installing from the monorepo root so pnpm hoists a single Next.js copy.

In MDX, prefer short excerpts over pasting entire source files; link to GitHub for full listings. Long highlighted blocks inflate HTML without helping readers.

## 5. Verify

```bash
pnpm run ci
cd apps/experiments/<slug> && pnpm build
```

## Definition of done

- Unique slug and valid metadata
- Standalone app builds with `pnpm build` inside its folder
- Appears in directory/search when published
- Docs page shows deploy / run-locally guidance
- Demo handles invalid input and missing configuration honestly
- Docs follow the full template
- Meaningful automated tests for non-trivial logic
