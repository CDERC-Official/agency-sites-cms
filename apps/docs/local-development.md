# Local development

How to run the Payload CMS (`apps/cms`) and Nuxt frontend (`apps/web`) on your machine.

## Prerequisites

- Node.js 20.9+
- pnpm 10.8.1 (via Corepack or the repo `packageManager` field)
- PostgreSQL reachable locally (or via Docker Compose)
- Docker Engine (required for Compose and for Wrangler Containers)

## Which mode to use

| Mode | Command | Ports | When to use |
| ---- | ------- | ----- | ----------- |
| Hot reload (recommended) | `pnpm install` + env files + `pnpm dev` / `pnpm dev:cms` / `pnpm dev:web` | CMS `:3000`, web `:3001` | Day-to-day feature work |
| Docker Compose | `docker compose up --build` | same | Full stack with bundled Postgres and hot reload |
| Cloudflare parity | Postgres up + root `.dev.vars` + `pnpm dev:cms:container`; web via `pnpm --filter @liskof-digital/web cf:dev` | CMS Worker `:8787` | Smoke-test Container / Worker behavior before deploy |

---

## Environment files

| File | Used by | Purpose |
| ---- | ------- | ------- |
| `apps/cms/.env.local` | Next.js CMS (`pnpm dev:cms`) | `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, optional R2 |
| `apps/web/.env.local` | Nuxt (`pnpm dev:web`) | `NUXT_PUBLIC_PAYLOAD_URL`, optional `NUXT_PAYLOAD_API_TOKEN` |
| `apps/cms/.env.docker` / `apps/web/.env.docker` | Docker Compose | Same keys; Compose overrides `DATABASE_URL` to the `db` service |
| `.dev.vars` (repo root) | Wrangler CMS Container (`pnpm dev:cms:container`) | Secrets forwarded into the production-like container |

Copy examples before first run:

```bash
cp apps/cms/.env.example apps/cms/.env.local
cp apps/web/.env.example apps/web/.env.local
cp .dev.vars.example .dev.vars   # only needed for container parity
```

For Docker Compose:

```bash
cp apps/cms/.env.docker.example apps/cms/.env.docker
cp apps/web/.env.docker.example apps/web/.env.docker
```

Never commit real secrets. `.env*`, `.dev.vars`, and Docker env files are gitignored; the `*.example` files are not.

---

## Mode 1: Hot reload with pnpm

1. Install dependencies from the repository root:

   ```bash
   pnpm install
   ```

2. Create `apps/cms/.env.local` and `apps/web/.env.local` from the examples. Set at least:

   - CMS: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`
   - Web: `NUXT_PUBLIC_PAYLOAD_URL=http://localhost:3000`

3. Ensure PostgreSQL is running and the database exists.

4. Run migrations once:

   ```bash
   pnpm --filter @liskof-digital/cms payload migrate
   ```

5. Start both apps, or one of them:

   ```bash
   pnpm dev          # CMS + web via Turbo
   pnpm dev:cms      # Payload on http://localhost:3000
   pnpm dev:web      # Nuxt on http://localhost:3001
   ```

6. Open [http://localhost:3000/admin](http://localhost:3000/admin). The first user created becomes the initial administrator.

In this mode the CMS runs Next.js in development (`NODE_ENV` is not production), so R2 media storage is not required.

---

## Mode 2: Docker Compose

Requirements: Docker Engine and the Compose plugin.

```bash
cp apps/cms/.env.docker.example apps/cms/.env.docker
cp apps/web/.env.docker.example apps/web/.env.docker
docker compose up --build
```

Compose starts PostgreSQL, waits until it is healthy, runs Payload migrations, and starts both apps with source mounts for hot reload.

- Payload: [http://localhost:3000/admin](http://localhost:3000/admin)
- Nuxt: [http://localhost:3001](http://localhost:3001)

`DATABASE_URL` is set to the Compose `db` service (`postgres://payload:payload@db:5432/agency_sites`). Data persists in a named volume.

Stop with `docker compose down`. Rebuild after changing dependencies or package manifests.

The Docker env examples use local-only credentials and must not be used in production.

---

## Mode 3: Cloudflare parity (Wrangler)

Use this to exercise the same Worker + Container path as production.

### CMS Container

1. Start PostgreSQL on the host (Compose `db` service alone, or any local Postgres). Publish port `5432` to the host.

2. Copy and edit root Wrangler secrets:

   ```bash
   cp .dev.vars.example .dev.vars
   ```

   Important: inside the Cloudflare Container, `localhost` is the container itself. Point `DATABASE_URL` at the Docker host:

   ```text
   DATABASE_URL=postgresql://USER:PASSWORD@host.docker.internal:5432/DATABASE
   NEXT_PUBLIC_SERVER_URL=http://localhost:8787
   ```

   Set `PAYLOAD_SECRET` and the optional `CRON_SECRET` / `PREVIEW_SECRET`. R2 keys can stay empty for browse-only smoke tests; media uploads need real R2 values because the container runs with `NODE_ENV=production`.

3. Ensure Docker is running, then:

   ```bash
   pnpm dev:cms:container
   ```

   Wrangler builds `apps/cms/Dockerfile`, starts the routing Worker, and serves the CMS at [http://localhost:8787](http://localhost:8787). First image build takes several minutes.

4. Run migrations against the same database the container uses (from the host, with a host-reachable URL such as `localhost`):

   ```bash
   pnpm --filter @liskof-digital/cms payload migrate
   ```

The Worker in `apps/cms/worker/index.ts` forwards bindings from `.dev.vars` into the container via `import { env } from 'cloudflare:workers'`. Do not use `this.env` in class-field `envVars` initializers; those run before Durable Object `this.env` is ready and become the string `"undefined"`.

### Nuxt Worker

```bash
pnpm --filter @liskof-digital/web build
pnpm --filter @liskof-digital/web cf:dev
```

Point `NUXT_PUBLIC_PAYLOAD_URL` at the CMS you are testing (`http://localhost:3000` or `http://localhost:8787`).

---

## Pointing Nuxt at the CMS

| CMS mode | `NUXT_PUBLIC_PAYLOAD_URL` |
| -------- | ------------------------- |
| `pnpm dev:cms` / Compose | `http://localhost:3000` |
| `pnpm dev:cms:container` | `http://localhost:8787` |

Optional server-only token: `NUXT_PAYLOAD_API_TOKEN`.

---

## Useful commands

```bash
pnpm --filter @liskof-digital/cms build
pnpm --filter @liskof-digital/cms generate:types
pnpm --filter @liskof-digital/cms generate:importmap
pnpm --filter @liskof-digital/cms payload migrate
pnpm check-types
```

---

## Troubleshooting

### `GET /` or `/admin` returns 500; browser shows Minified React error #441

React `#441` means a Server Component failed in the production build; the real message is only in server logs. For the CMS container:

```bash
docker ps --format '{{.ID}} {{.Names}}' | awk '/CmsContainer/ && $0 !~ /-proxy/'
docker logs <container-id>
```

Typical causes:

- Missing `DATABASE_URL` in `.dev.vars` (container receives the string `"undefined"` and Postgres fails with confusing DNS errors such as `ENOTFOUND base`)
- `DATABASE_URL` uses `localhost` instead of `host.docker.internal`
- Postgres is not running or credentials do not match

### Container builds every time and takes a long time

Expected on the first `dev:cms:container` run and after Dockerfile or dependency changes. Subsequent starts reuse the image when the build context is unchanged.

### Media uploads fail only in the container / production

Production enables Cloudflare R2 via `@payloadcms/storage-s3`. Set `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_ENDPOINT` in `.dev.vars` (local) or Worker secrets (deployed).

### See also

- [Cloudflare deployment](./cloudflare-deployment.md)
- [Architecture & deployment strategy](./architecture-deployment.md)
