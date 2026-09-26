FROM node:22-bookworm-slim AS development

ENV COREPACK_HOME=/home/node/.cache/node/corepack
WORKDIR /workspace

RUN corepack enable && chown node:node /workspace

# Include source before install because Nuxt's postinstall hook generates types
# from nuxt.config.ts.
COPY --chown=node:node . .
USER node

RUN pnpm install --frozen-lockfile --network-concurrency=4 --fetch-retries=5 --fetch-timeout=120000

# Named volumes inherit the ownership of these paths on first use.
USER root
RUN mkdir -p apps/cms/.next apps/web/.nuxt \
  && chown -R node:node apps/cms/.next apps/web/.nuxt
USER node

EXPOSE 3000 3001

CMD ["pnpm", "dev"]
