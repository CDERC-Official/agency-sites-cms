# Agency Sites Platform

Turborepo workspace for the Payload CMS backend and Nuxt 4 frontend.

```text
apps/
  cms/                 Payload 3 + Next.js admin/API
  web/                 Nuxt 4 frontend
  docs/                reserved for documentation
packages/
  ui/                  shared Vue components
  design-system/       shared themes and tokens
  types/               shared TypeScript types
  config/              shared TypeScript config
  eslint-config/       shared ESLint config
  utils/               framework-independent utilities
```

## Run the CMS

Requirements: Node.js 20.9+ and pnpm 10.8.1. From the repository root:

1. Install dependencies with `pnpm install`.
2. Create `apps/cms/.env.local` and set `PAYLOAD_SECRET` plus `DATABASE_URL` to a PostgreSQL connection string. `DATABASE_URL` may also be supplied through `POSTGRES_URL_NON_POOLING` or `STORAGE_POSTGRES_URL`.
3. Start both apps with `pnpm dev`, or only Payload with `pnpm dev:cms`. Open [http://localhost:3000/admin](http://localhost:3000/admin) for Payload and [http://localhost:3001](http://localhost:3001) for Nuxt.

The first user created in the admin becomes the initial administrator. The configured database adapter is Payload's Vercel Postgres adapter, which accepts a normal Postgres URL for local development. Production media storage uses Vercel Blob when `NODE_ENV=production` and requires `BLOB_MEDIA_READ_WRITE_TOKEN`.

## Environment variables

Keep local variables with the app that uses them. For the CMS, copy `apps/cms/.env.example` to `apps/cms/.env.local`; for Nuxt, copy `apps/web/.env.example` to `apps/web/.env.local`. These local files are ignored by Git. Put production values in the deployment platform's environment settings. Expose browser-safe Nuxt values through `runtimeConfig.public`; keep secrets in private runtime config. Never prefix secrets with `NEXT_PUBLIC_` or `NUXT_PUBLIC_`.

Turbo's strict environment mode is enabled. CMS and Nuxt build variables are listed in `turbo.json`, and each app's `.env*` files are build inputs so changing local environment configuration invalidates the build cache. Shared packages should receive required settings through their consuming app rather than loading app-specific `.env` files themselves.

## Run both apps with Docker

Requirements: Docker Engine and the Docker Compose plugin. Copy `apps/cms/.env.docker.example` to `apps/cms/.env.docker` and `apps/web/.env.docker.example` to `apps/web/.env.docker`, then run:

```bash
docker compose up --build
```

Open Payload at [http://localhost:3000/admin](http://localhost:3000/admin) and Nuxt at [http://localhost:3001](http://localhost:3001). The Compose setup starts PostgreSQL, waits for it to become healthy, and runs both apps in development mode with source hot reload. App env files are passed only to their matching containers; the database URL is set to the Compose `db` service. PostgreSQL data persists in a named volume.

Stop the services with `docker compose down`. Rebuild with `docker compose up --build` after changing dependencies or package manifests. The Docker env examples use local-only credentials and must not be used in production.

Useful commands:

- `pnpm --filter @liskof-digital/cms build` builds the CMS.
- `pnpm --filter @liskof-digital/cms generate:types` refreshes Payload generated types.
- `pnpm --filter @liskof-digital/cms generate:importmap` refreshes the admin import map.
- `pnpm --filter @liskof-digital/cms payload migrate` runs database migrations.
- `pnpm dev:web` starts only the Nuxt frontend on port 3001.
- `pnpm check-types` runs TypeScript checks for configured workspaces.

Root commands use Turbo so both apps and shared packages join the same build and type-check pipeline. The Nuxt app consumes the shared Vue UI, design-system, types, config, and utils packages.
