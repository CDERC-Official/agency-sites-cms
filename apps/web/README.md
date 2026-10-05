# Nuxt frontend

Nuxt 4 application in the Liskof Digital workspace. Run it with `pnpm dev:web` from the repository root or `pnpm --filter @liskof-digital/web dev`.

Copy `.env.example` to `.env.local` for local configuration. The app uses `NUXT_PUBLIC_PAYLOAD_URL` for the public CMS URL and `NUXT_PAYLOAD_API_TOKEN` for an optional server-only token.

## Cloudflare

Full local and deploy steps live in:

- [Local development](../docs/local-development.md)
- [Cloudflare deployment](../docs/cloudflare-deployment.md)

### Preview the Worker locally

From the repo root:

```bash
pnpm --filter @liskof-digital/web cf:dev
```

### Deploy Nuxt

Authenticate with Wrangler if needed (`wrangler login`), then from the repo root:

```bash
pnpm deploy:web
```
