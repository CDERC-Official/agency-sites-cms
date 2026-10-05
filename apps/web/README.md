# Nuxt frontend

Nuxt 4 application in the Liskof Digital workspace. Run it with `pnpm dev:web` from the repository root or `pnpm --filter @liskof-digital/web dev`.

Copy `.env.example` to `.env.local` for local Nuxt dev. The app uses `NUXT_PUBLIC_PAYLOAD_URL` for the public CMS URL and `NUXT_PAYLOAD_API_TOKEN` for an optional server-only token.

Requires Node.js 24 (repo `.nvmrc`). Nitro preset is `cloudflare_module`.

## Cloudflare

Full local and deploy steps live in:

- [Local development](../docs/local-development.md)
- [Cloudflare deployment](../docs/cloudflare-deployment.md)

### Preview the Worker locally

Wrangler does not read `.env.local`. Copy the Worker env file, then build and serve:

```bash
cp apps/web/.dev.vars.example apps/web/.dev.vars
pnpm dev:web:cf
```

`dev:web:cf` runs `nuxt build` and then `wrangler dev` with [`wrangler.jsonc`](./wrangler.jsonc). Output is `.output/server/index.mjs` and `.output/public`.

### Deploy Nuxt

Authenticate with Wrangler if needed (`wrangler login`), then from the repo root:

```bash
pnpm deploy:web
```

Set `NUXT_PUBLIC_PAYLOAD_URL` and any `NUXT_PAYLOAD_API_TOKEN` on the Worker. Do not commit `.dev.vars`.
