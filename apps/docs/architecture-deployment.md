# Cloudflare Architecture & Deployment Strategy

## Runbooks

Operational steps live in dedicated docs:

- [Local development](./local-development.md) — pnpm, Docker Compose, and Wrangler Container parity
- [Cloudflare deployment](./cloudflare-deployment.md) — secrets, `pnpm deploy:cms` / `pnpm deploy:web`, Workers Builds

## Overview

This project is a multi-tenant web agency platform built as a **Turborepo monorepo** with:

* **Nuxt** for the frontend
* **Payload CMS** for content management
* **Cloudflare Workers** for the Nuxt frontend and CMS request routing
* **Cloudflare Containers** for the Payload Next.js application
* **PostgreSQL** for CMS data
* **Cloudflare R2** for media/file storage
* **Cloudflare DNS** for domain management

The architecture is designed to start with a small, single CMS container and scale as clients and traffic increase.

The MVP uses Workers Paid because Cloudflare Containers are not available on Workers Free. Keep the CMS to one basic instance with scale-to-zero while the platform is small, and review usage before increasing capacity.

---

# 1. Architecture Goals

The infrastructure should provide:

1. **A small, usage-aware initial cost**
2. **Simple deployment**
3. **Independent deployment of frontend and CMS**
4. **Multi-tenant support**
5. **Shared code across applications**
6. **Easy scaling as clients are added**
7. **Minimal DevOps overhead**
8. **Cloudflare-native infrastructure where practical**
9. **No unnecessary infrastructure before the first clients**
10. **A clear migration path from prototype to production**

---

# 2. High-Level Architecture

```text
                         GitHub
                           │
                           │
                      Turborepo
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
      ┌─────────────┐             ┌─────────────┐
      │ Nuxt Worker │             │ CMS Worker   │
      │             │             │             │
      │ Frontend    │             │ Request route│
      └──────┬──────┘             └──────┬──────┘
             │                           ▼
             │                    Payload Container
             │                     │           │
             │                     ▼           ▼
             │                PostgreSQL   Cloudflare R2
             │                 Database     Media / Files
             ▼
          Cloudflare DNS
                 │
                 ▼
          Custom Domains
```

The repository remains a single Turborepo. Cloudflare deploys Nuxt as a Worker and Payload as a Container behind a small routing Worker.

---

# 3. Repository Structure

The repository uses the following structure:

```text
agency-sites-platform/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── nuxt.config.ts
│   │   ├── wrangler.jsonc
│   │   └── package.json          # @liskof-digital/web
│   │
│   ├── cms/
│   │   ├── src/
│   │   ├── worker/index.ts       # Container routing Worker
│   │   ├── Dockerfile
│   │   ├── payload.config.ts
│   │   └── package.json          # @liskof-digital/cms
│   │
│   └── docs/
│       ├── architecture-deployment.md
│       ├── local-development.md
│       └── cloudflare-deployment.md
│
├── packages/
│   ├── ui/
│   ├── design-system/
│   ├── types/
│   ├── utils/
│   ├── config/
│   └── eslint-config/
│
├── wrangler.jsonc                # agency-sites-cms Worker + Container
├── docker-compose.yml
├── .dev.vars.example
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## Applications

### `apps/web`

The Nuxt application responsible for:

* Public websites
* Tenant-specific websites
* Server-side rendering
* SEO
* Static pages
* Dynamic content
* Tenant resolution
* Public forms

### `apps/cms`

The Payload CMS application responsible for:

* Content management
* Users
* Media
* Pages
* Navigation
* Site configuration
* Forms
* Tenant content

The CMS Docker image is built from `apps/cms/Dockerfile`. Local and remote Container traffic is routed by the Worker in `apps/cms/worker/index.ts` (configured via the root `wrangler.jsonc`).

---

# 4. Shared Packages

Shared functionality should live under `packages/`.

Example:

```text
packages/
├── ui/
├── design-system/
├── types/
├── utils/
├── config/
└── eslint-config/
```

These packages are **not deployed independently**.

Instead, they are compiled into the application that uses them.

For example:

```text
packages/ui
      │
      ▼
apps/web
      │
      ▼
Nuxt build
      │
      ▼
Cloudflare Worker
```

This allows the frontend and CMS to share:

* TypeScript types
* UI components
* Configuration
* Validation
* Utility functions

while maintaining separate deployments.

---

# 5. Cloudflare Deployment Model

The repository is deployed as a Nuxt Worker and a Payload Container behind a routing Worker.

## Frontend Worker

```text
Worker:
agency-web

Source:
apps/web

Technology:
Nuxt

Runtime:
Cloudflare Workers
```

## CMS Container and routing Worker

```text
Worker:
agency-sites-cms

Source:
apps/cms

Technology:
Payload CMS on Next.js

Runtime:
Cloudflare Container (basic instance, maximum one instance)
```

The Worker in the root `wrangler.jsonc` forwards requests to the container. The container runs `apps/cms/Dockerfile` on port 3000. `apps/cms/worker/index.ts` forwards the Worker environment variables and secrets into the container (via `import { env } from 'cloudflare:workers'`).

Before the first deployment, set these on the `agency-sites-cms` Worker:

| Type | Names |
| ---- | ----- |
| Secrets | `DATABASE_URL`, `PAYLOAD_SECRET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` |
| Variables | `NEXT_PUBLIC_SERVER_URL`, `R2_BUCKET`, `R2_ENDPOINT` |
| Optional | `STORAGE_POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `CRON_SECRET`, `PREVIEW_SECRET` |

The Worker forwards these settings to the Container. Set secrets in the Cloudflare dashboard or with `wrangler secret put`. Do not commit production values. Deploy with `pnpm deploy:cms` from the repository; Docker must be running locally for Wrangler to build and upload the image.

Step-by-step deploy instructions: [cloudflare-deployment.md](./cloudflare-deployment.md).

Both applications can use the same GitHub repository.

Cloudflare Workers Builds should be configured with the appropriate application root directory and build/deployment commands (see the deployment runbook).

---

# 6. Nuxt Deployment

Nuxt runs on Cloudflare Workers using the Cloudflare/Nitro deployment preset.

Example:

```ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare'
  }
})
```

The frontend is deployed independently from Payload.

Conceptually:

```text
GitHub
   │
   ▼
Turborepo
   │
   ▼
apps/web
   │
   ├── packages/ui
   ├── packages/types
   └── packages/utils
   │
   ▼
Nuxt build
   │
   ▼
Cloudflare Worker
```

---

# 7. Payload CMS Deployment

Payload runs in a Cloudflare Container, with a small Worker handling incoming requests.

Conceptually:

```text
GitHub
   │
   ▼
Turborepo
   │
   ▼
apps/cms
   │
   ├── packages/design-system
   └── packages/config
   │
   ▼
Next.js standalone Docker build
   │
   ▼
Cloudflare Container
   ▲
   │
CMS request-routing Worker
```

Payload provides the CMS and API layer consumed by the Nuxt applications.

---

# 8. Database and Storage

## Database

The current CMS uses **PostgreSQL** through Payload's Postgres adapter. Set `DATABASE_URL` to a reachable managed PostgreSQL database and keep the provider replaceable.

```text
Payload Container
      │
      ▼
 PostgreSQL
```

Payload also provides a D1 adapter. Using D1 would require changing the current Postgres adapter and running Payload in a Worker-compatible deployment instead of this Docker Container. Treat that as a separate future option, not as the database behind this container.

---

# 9. Media Storage

Media should be stored separately from the database.

Use:

```text
Cloudflare R2
```

for:

* Images
* Videos
* Documents
* Uploaded media
* Other large files

Architecture:

```text
Payload
   │
   ▼
  R2
   │
   ├── images
   ├── videos
   ├── documents
   └── other media
```

The database should store metadata and references rather than large binary files.

---

# 10. Multi-Tenant Architecture

The platform is intended to support multiple customer websites.

Initially, **do not create a separate Worker for every customer**.

Instead, use a shared Nuxt Worker.

Example:

```text
                   Nuxt Worker
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
      Tenant A     Tenant B     Tenant C
          │            │            │
          ▼            ▼            ▼
    client-a.com  client-b.com  client-c.com
```

The incoming hostname is used to resolve the tenant.

Example:

```ts
const hostname = getRequestHost(event)

const tenant = await getTenantByDomain(hostname)
```

The tenant configuration determines:

* Branding
* Theme
* Content
* Navigation
* Pages
* SEO settings
* Features
* Domain configuration

---

# 11. Tenant Resolution

A simplified request flow:

```text
Browser
   │
   ▼
client-a.com
   │
   ▼
Cloudflare DNS
   │
   ▼
Nuxt Worker
   │
   ▼
Resolve hostname
   │
   ▼
Find Tenant
   │
   ▼
Load tenant configuration
   │
   ▼
Fetch Payload content
   │
   ▼
Render Nuxt page
   │
   ▼
Response
```

The application should treat the hostname as the primary tenant identifier.

Example:

```text
client-a.com → tenant_a
client-b.com → tenant_b
client-c.com → tenant_c
```

---

# 12. Platform vs Tenant Websites

As the product evolves, the repository can support three applications:

```text
apps/
├── platform-web/
├── tenant-web/
└── cms/
```

## Platform Web

The agency/platform administration application.

Responsibilities:

* Tenant management
* User management
* Domains
* Site configuration
* Billing
* Platform settings
* System administration

Example:

```text
platform.example.com
```

## Tenant Web

The public website application used by customer websites.

Example:

```text
client-a.com
client-b.com
client-c.com
```

## CMS

Payload provides the content management layer.

```text
cms.example.com
```

or an internal/private CMS endpoint.

---

# 13. Initial Infrastructure: Pre-Client Phase

Before the first client, infrastructure should remain deliberately simple.

Recommended setup:

| Component             | Initial setup             |
| --------------------- | ------------------------- |
| Nuxt                  | Cloudflare Workers Free   |
| Payload               | Cloudflare Container (Workers Paid) |
| Database              | Managed PostgreSQL        |
| Media                 | Cloudflare R2             |
| DNS                   | Cloudflare                |
| Repository            | GitHub                    |
| CI/CD                 | Cloudflare Workers Builds |
| Monorepo              | Turborepo                 |
| Package manager       | pnpm                      |
| Custom client domains | Not required              |
| Production scaling    | Not required yet          |

The CMS Container requires Workers Paid (currently a $5/month account minimum, plus metered Container and Worker usage). Start with one basic instance and its idle sleep setting; the remote CMS is not a zero-cost service.

---

# 14. Development Environment

Local development should mirror the production architecture as much as practical. Prefer the runbook in [local-development.md](./local-development.md) for step-by-step setup.

Example:

```text
Developer Machine
       │
       ▼
   Turborepo
       │
       ├───────────────┐
       ▼               ▼
   Nuxt dev         Payload dev
       │               │
       └───────┬───────┘
               │
          Local services
```

Development commands from the repository root:

```bash
pnpm install
pnpm dev
```

Build everything:

```bash
pnpm build
```

Build only the frontend:

```bash
pnpm --filter @liskof-digital/web build
```

Build only the CMS:

```bash
pnpm --filter @liskof-digital/cms build
```

Deploy the frontend:

```bash
pnpm deploy:web
```

Deploy the CMS (Docker required):

```bash
pnpm deploy:cms
```

Cloudflare Container parity locally:

```bash
pnpm dev:cms:container
```

See [cloudflare-deployment.md](./cloudflare-deployment.md) for secrets, domains, and Workers Builds.

---

# 15. Turborepo Responsibilities

Turborepo is responsible for:

* Task orchestration
* Dependency-aware builds
* Caching
* Running applications independently
* Building shared packages
* Managing monorepo dependencies

Example dependency graph:

```text
             packages/ui
                  │
                  ▼
              apps/web
                  │
                  ▼
          Cloudflare Worker


          packages/types
             │       │
             ▼       ▼
         apps/web   apps/cms
             │       │
             ▼       ▼
          Worker   Worker
```

Turborepo does not replace Cloudflare's deployment system.

Instead:

```text
Turborepo
    +
Cloudflare Workers Builds
    =
Monorepo deployment architecture
```

---

# 16. CI/CD

The desired deployment flow is:

```text
Developer
    │
    ▼
git push
    │
    ▼
GitHub
    │
    ▼
Cloudflare Workers Builds
    │
    ├──────────────────┐
    │                  │
    ▼                  ▼
Nuxt build         CMS image build
    │                  │
    ▼                  ▼
Nuxt Worker        CMS routing Worker + Container
```

Suggested build and path filters are documented in [cloudflare-deployment.md](./cloudflare-deployment.md).

Applications should be independently deployable.

A change to:

```text
apps/web/**
```

should normally only require a frontend deployment.

A change to:

```text
apps/cms/**
```

or the root `wrangler.jsonc` / CMS Dockerfile should normally only require a CMS deployment.

A change to:

```text
packages/**
```

may require both applications to be rebuilt.

---

# 17. Environment Strategy

Use separate environments.

At minimum:

```text
development
staging
production
```

Example:

```text
Development
    │
    ├── local Nuxt
    └── local Payload

Staging
    │
    ├── staging Nuxt Worker
    └── staging CMS routing Worker + Container

Production
    │
    ├── production Nuxt Worker
    └── production CMS routing Worker + Container
```

Production secrets must never be committed to Git.

Use Cloudflare environment variables and secrets.

For the MVP, skip Cloudflare caching and Cloudflare's image service. Payload's existing Sharp processing remains enabled inside the CMS container for Payload upload sizes.

---

# 18. Scaling Strategy

The platform should scale incrementally.

## Phase 1 — No clients

```text
Cloudflare Workers Paid
      │
      ├── Nuxt Worker
      ├── CMS routing Worker + one basic Container
      ├── PostgreSQL
      └── R2
```

Workers Paid has a $5/month minimum. Container CPU, memory, disk, Worker, and Durable Object usage can add charges. A basic Container has 1 GiB of memory. Review [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [Containers pricing](https://developers.cloudflare.com/containers/platform/pricing/) before raising limits.

Focus:

* Build MVP
* Validate architecture
* Build portfolio/demo sites
* Test multi-tenancy
* Acquire first clients

---

## Phase 2 — First clients

Introduce:

```text
Tenant management
Custom domains
Production backups
Monitoring
Error tracking
Staging environment
```

The architecture remains fundamentally unchanged.

---

## Phase 3 — Growing client base

Add:

```text
Caching
Queues
Background jobs
Scheduled tasks
Advanced observability
Database optimization
R2 optimization
Cloudflare WAF configuration
```

The CMS already uses Workers Paid for Containers. Review actual usage and sizing before increasing the Container instance type or maximum instance count.

---

## Phase 4 — Larger platform

Potential architecture:

```text
                         Cloudflare
                             │
                ┌────────────┴────────────┐
                │                         │
          Platform Worker           Tenant Workers
                │                         │
                └────────────┬────────────┘
                             │
                       Payload/API
                             │
                ┌────────────┼────────────┐
                │            │            │
               DB           R2         Queues
```

At this stage, database architecture and tenant isolation should be reviewed based on real usage.

---

# 19. Cost Strategy

The infrastructure should follow a **pay-for-usage progression**.

```text
                Cost
                 │
                 │                     ┌──────
                 │                ┌────┘
                 │           ┌────┘
                 │      ┌────┘
                 │ ┌────┘
                 └──────────────────────────
                   No clients → Clients → Scale
```

The project should not prematurely introduce:

* Kubernetes
* Dedicated servers
* Complex container orchestration
* Separate infrastructure per client
* Expensive managed databases
* Dedicated Workers per tenant

unless actual requirements justify them.

---

# 20. Architecture Principles

The following principles should guide future infrastructure decisions.

### 1. Keep the beginning simple

The platform has no clients initially.

The MVP deliberately accepts the Workers Paid baseline to run the CMS as a Container. Keep the instance count and size low until actual usage requires more.

### 2. Separate applications

Nuxt and Payload should be independently deployable.

### 3. Share code, not runtime

Shared packages belong in the monorepo.

Applications should remain independently deployable.

### 4. Multi-tenancy by configuration

Prefer:

```text
one application
+
many tenants
```

over:

```text
one application
per tenant
```

at the beginning.

### 5. Avoid vendor lock-in in business logic

Cloudflare-specific infrastructure should be isolated behind clear abstractions where practical.

### 6. Scale when necessary

Increase beyond the current Workers Paid baseline based on:

* Traffic
* Storage
* Database usage
* Number of tenants
* Performance requirements
* Reliability requirements

not assumptions.

---

# 21. Target Architecture

The intended long-term architecture is:

```text
                             GitHub
                               │
                         Turborepo
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
        Platform Web                     Tenant Web
          Nuxt Worker                    Nuxt Worker
                │                             │
                │                    ┌────────┴────────┐
                │                    │                 │
                │               Tenant A          Tenant B
                │                    │                 │
                └────────────┬───────┴─────────────────┘
                             │
                             ▼
                    CMS routing Worker
                             │
                             ▼
                     Payload Container
                       │           │
                       ▼           ▼
                  PostgreSQL       R2
                  Database        Media
                    │
                    ▼
               Cloudflare
            DNS / CDN / WAF
```

The important property of this architecture is that the **deployment model can remain almost unchanged as the number of clients grows**.

---

# 22. Decision Summary

### Initial decision

Use:

```text
Turborepo
    +
Nuxt
    +
Payload CMS
    +
Nuxt on Cloudflare Workers
    +
Payload in Cloudflare Containers
    +
PostgreSQL
    +
Cloudflare R2
```

### Deployment model

```text
One Git repository
       │
       ├── Nuxt Worker
       └── CMS routing Worker → Payload Container
```

### Multi-tenancy

```text
One shared frontend Worker
       │
       ├── Tenant A
       ├── Tenant B
       ├── Tenant C
       └── ...
```

### Cost strategy

Use Cloudflare's free allowances for eligible services such as the Nuxt Worker, R2, and DNS. The CMS Container runs on Workers Paid; increase its size or instance count only when actual usage requires it.

### Primary architectural goal

> **Build the smallest infrastructure that can evolve into the full multi-tenant agency platform without requiring a major architectural rewrite.**
