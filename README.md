# Agency Sites Platform

Turborepo monorepo for a **Payload CMS** backend and **Nuxt 4** frontend, deployed on Cloudflare:

- `apps/cms` — Payload 3 + Next.js → Cloudflare Containers (routing Worker + Docker image)
- `apps/web` — Nuxt 4 → Cloudflare Workers
- `apps/docs` — architecture and runbooks

```text
apps/
  cms/                 Payload admin/API (Container)
  web/                 Nuxt frontend (Worker)
  docs/                architecture + local/deploy guides
packages/
  ui/                  shared Vue components
  design-system/       shared themes and tokens
  types/               shared TypeScript types
  config/              shared TypeScript / Nuxt config
  eslint-config/       shared ESLint config
  utils/               framework-independent utilities
```

## Prerequisites

- Node.js 24 (current Active LTS; see `.nvmrc`)
- pnpm 10.8.1
- PostgreSQL for the CMS
- Docker (Compose and/or Wrangler Containers)

## Quick start (local hot reload)

From the repository root:

```bash
pnpm install
docker compose up -d db
cp apps/cms/.env.example apps/cms/.env.local
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local files: PAYLOAD_SECRET, NUXT_PUBLIC_PAYLOAD_URL, etc.
# DATABASE_URL in the CMS example already matches Compose db.
pnpm --filter @liskof-digital/cms payload migrate
pnpm dev
```

- Payload admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- Nuxt: [http://localhost:3001](http://localhost:3001)

The first user created in the admin becomes the initial administrator.

### Other local modes

| Mode | How |
| ---- | --- |
| Docker Compose | `cp apps/cms/.env.docker.example apps/cms/.env.docker` (and web), then `docker compose up --build` |
| CMS Container parity | `cp .dev.vars.example .dev.vars`, use `host.docker.internal` in `DATABASE_URL`, then `pnpm dev:cms:container` → [http://localhost:8787](http://localhost:8787) |
| Web Worker parity | `cp apps/web/.dev.vars.example apps/web/.dev.vars`, then `pnpm dev:web:cf` (builds Nuxt, then `wrangler dev`) |

Full details: [apps/docs/local-development.md](apps/docs/local-development.md).

## Environment variables

| Location | App |
| -------- | --- |
| `apps/cms/.env.local` | Next.js CMS (day-to-day) |
| `apps/web/.env.local` | Nuxt |
| `.dev.vars` (repo root) | Wrangler CMS Container / secrets for local Worker |
| `apps/web/.dev.vars` | Local Nuxt Worker (`pnpm dev:web:cf`); Wrangler does not read `.env.local` |
| Cloudflare dashboard / `wrangler secret put` | Production / staging |

Production CMS media uses **Cloudflare R2** (`R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`) when `NODE_ENV=production`. Do not commit secrets. Never prefix secrets with `NEXT_PUBLIC_` or `NUXT_PUBLIC_`.

## Deploy to Cloudflare

```bash
wrangler login
pnpm deploy:cms    # Docker required; Worker + Container
pnpm deploy:web    # Nuxt Worker
```

Secrets, domains, and Workers Builds: [apps/docs/cloudflare-deployment.md](apps/docs/cloudflare-deployment.md).

Architecture and scaling strategy: [apps/docs/architecture-deployment.md](apps/docs/architecture-deployment.md).

## Useful commands

```bash
pnpm build
pnpm check-types
pnpm generate:types
pnpm generate:importmap
pnpm --filter @liskof-digital/cms payload migrate
pnpm dev:cms
pnpm dev:web
pnpm dev:web:cf
pnpm deploy:cms
pnpm deploy:web
```

Root commands use Turbo so both apps and shared packages join the same build and type-check pipeline.
