FROM node:24-bookworm-slim AS build

ENV COREPACK_HOME=/home/node/.cache/node/corepack
WORKDIR /workspace

RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile --network-concurrency=4 --fetch-retries=5 --fetch-timeout=120000
# Payload is initialized while Next.js statically generates pages. Give that
# build process an ephemeral secret; production receives its secret at runtime.
RUN PAYLOAD_SECRET="$(node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))')" pnpm --filter @liskof-digital/cms build

FROM node:24-bookworm-slim AS production

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

COPY --from=build --chown=node:node /workspace/apps/cms/.next/standalone ./
COPY --from=build --chown=node:node /workspace/apps/cms/.next/static ./apps/cms/.next/static
COPY --from=build --chown=node:node /workspace/apps/cms/public ./apps/cms/public

USER node
EXPOSE 3000

CMD ["node", "apps/cms/server.js"]
