# Cloudflare deployment

Deploy the Nuxt frontend to Cloudflare Workers and the Payload CMS to Cloudflare Containers behind a small routing Worker.

## Architecture (runtime)

```text
Browser
   │
   ├──────────────────┐
   ▼                  ▼
agency-sites-web   agency-sites-cms
(Nuxt Worker)      (routing Worker)
                         │
                         ▼
                  Payload Container
                   │           │
                   ▼           ▼
              PostgreSQL   Cloudflare R2
```

| App | Wrangler config | Package scripts |
| --- | --------------- | --------------- |
| Web | [`apps/web/wrangler.jsonc`](../web/wrangler.jsonc) | `pnpm deploy:web` |
| CMS | [`wrangler.jsonc`](../../wrangler.jsonc) (repo root) | `pnpm deploy:cms` |

CMS Worker entry: [`apps/cms/worker/index.ts`](../cms/worker/index.ts). Container image: [`apps/cms/Dockerfile`](../cms/Dockerfile).

Cloudflare Containers require **Workers Paid**. Keep one basic CMS instance with scale-to-zero while traffic is low.

---

## Prerequisites

1. Cloudflare account on Workers Paid
2. [Wrangler](https://developers.cloudflare.com/workers/wrangler/) authenticated: `wrangler login`
3. Docker running locally (Wrangler builds and uploads the CMS image)
4. Managed PostgreSQL with a connection string Payload can reach from Cloudflare
5. Cloudflare R2 bucket and S3-compatible API credentials

---

## CMS: `agency-sites-cms`

### 1. Create dependencies

- Provision PostgreSQL and note `DATABASE_URL`.
- Create an R2 bucket. Create an R2 API token with object read/write on that bucket. Note endpoint `https://<account-id>.r2.cloudflarestorage.com`.

### 2. Configure Worker secrets and variables

From the repository root (config is root `wrangler.jsonc`):

```bash
# Secrets
pnpm exec wrangler secret put DATABASE_URL --config wrangler.jsonc
pnpm exec wrangler secret put PAYLOAD_SECRET --config wrangler.jsonc
pnpm exec wrangler secret put R2_ACCESS_KEY_ID --config wrangler.jsonc
pnpm exec wrangler secret put R2_SECRET_ACCESS_KEY --config wrangler.jsonc

# Optional secrets
pnpm exec wrangler secret put CRON_SECRET --config wrangler.jsonc
pnpm exec wrangler secret put PREVIEW_SECRET --config wrangler.jsonc
```

Set plain variables in the Cloudflare dashboard for Worker `agency-sites-cms`, or via Wrangler vars in a non-committed env-specific config:

| Name | Example |
| ---- | ------- |
| `NEXT_PUBLIC_SERVER_URL` | `https://cms.example.com` |
| `R2_BUCKET` | your bucket name |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |

Optional: `STORAGE_POSTGRES_URL`, `POSTGRES_URL_NON_POOLING` (Payload prefers these over `DATABASE_URL` when set).

The Container class forwards these bindings into the Node process. Locally the same keys live in root `.dev.vars` (see [local development](./local-development.md)).

### 3. Deploy

```bash
pnpm deploy:cms
```

This runs `wrangler deploy --config ../../wrangler.jsonc` from `apps/cms`, builds the Docker image from the monorepo context, and deploys the routing Worker plus Container.

### 4. Migrate the database

Point your local CMS env at the production (or staging) Postgres URL and run:

```bash
pnpm --filter @liskof-digital/cms payload migrate
```

Prefer a one-off secure migration path (CI job or temporary local `.env`) rather than baking production URLs into committed files.

### 5. Custom domain

In Cloudflare → Workers → `agency-sites-cms` → Domains, attach e.g. `cms.example.com`. Ensure `NEXT_PUBLIC_SERVER_URL` matches that public URL (no trailing slash).

Open `/admin` and create the first user if the database is empty.

---

## Web: `agency-sites-web`

Nuxt builds with Nitro preset `cloudflare` ([`apps/web/nuxt.config.ts`](../web/nuxt.config.ts)).

### 1. Configure environment

Set for the Worker (dashboard or Wrangler secrets/vars):

| Name | Required | Purpose |
| ---- | -------- | ------- |
| `NUXT_PUBLIC_PAYLOAD_URL` | Yes | Public CMS base URL (e.g. `https://cms.example.com`) |
| `NUXT_PAYLOAD_API_TOKEN` | No | Server-only token for authenticated Payload requests |

These map to Nuxt `runtimeConfig.public.payloadUrl` and `runtimeConfig.payloadApiToken`.

### 2. Deploy

```bash
pnpm deploy:web
```

This builds Nuxt (`.output/`) then runs `wrangler deploy` with [`apps/web/wrangler.jsonc`](../web/wrangler.jsonc).

### 3. Custom domains

Attach tenant or marketing domains to Worker `agency-sites-web`. The Worker resolves tenants by hostname in production (see [architecture](./architecture-deployment.md)).

---

## Environment checklist

### CMS Worker / Container

| Type | Names |
| ---- | ----- |
| Secrets | `DATABASE_URL`, `PAYLOAD_SECRET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` |
| Variables | `NEXT_PUBLIC_SERVER_URL`, `R2_BUCKET`, `R2_ENDPOINT` |
| Optional | `STORAGE_POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `CRON_SECRET`, `PREVIEW_SECRET` |

### Web Worker

| Type | Names |
| ---- | ----- |
| Variables / secrets | `NUXT_PUBLIC_PAYLOAD_URL`, optional `NUXT_PAYLOAD_API_TOKEN` |

Do not commit production values. Never prefix secrets with `NEXT_PUBLIC_` or `NUXT_PUBLIC_`.

---

## Cloudflare Workers Builds (optional CI)

Configure two independent builds on the same GitHub repository.

### Frontend

| Setting | Suggested value |
| ------- | --------------- |
| Application / root | repository root (pnpm workspace) or `apps/web` with install at root |
| Build command | `pnpm install && pnpm --filter @liskof-digital/web build` |
| Deploy command | `pnpm --filter @liskof-digital/web exec wrangler deploy` |
| Path include | `apps/web/**`, `packages/**`, `pnpm-lock.yaml`, `package.json` |

### CMS

| Setting | Suggested value |
| ------- | --------------- |
| Build / deploy | `pnpm install && pnpm deploy:cms` (Docker available on the build host) |
| Path include | `apps/cms/**`, root `wrangler.jsonc`, `Dockerfile` paths used by the CMS image, `packages/**` as needed, lockfile |

Notes:

- CMS image builds need Docker on the CI runner. If Workers Builds cannot build Containers in your account setup, deploy CMS from a machine with Docker via `pnpm deploy:cms`.
- A change under `apps/web/**` should deploy only the Nuxt Worker.
- A change under `apps/cms/**` or root `wrangler.jsonc` should deploy only the CMS Worker + Container.
- Shared package changes may require both.

---

## Staging vs production

Use separate Workers (or Wrangler environments), separate Postgres databases, and separate R2 buckets when possible.

```text
staging
  ├── staging Nuxt Worker
  └── staging CMS Worker + Container

production
  ├── production Nuxt Worker
  └── production CMS Worker + Container
```

Mirror the same secret names; only values and public URLs differ.

---

## Verify after deploy

1. `https://<cms-host>/admin` loads and accepts login.
2. Media upload works (R2 credentials correct).
3. `https://<web-host>/` loads and can fetch content from `NUXT_PUBLIC_PAYLOAD_URL`.
4. CORS: CMS `NEXT_PUBLIC_SERVER_URL` and Payload `cors` match the URLs you actually use.

---

## See also

- [Local development](./local-development.md)
- [Architecture & deployment strategy](./architecture-deployment.md)
