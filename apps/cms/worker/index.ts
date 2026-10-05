import { Container } from '@cloudflare/containers'
import { env } from 'cloudflare:workers'

interface Env {
  CMS_CONTAINER: DurableObjectNamespace<CmsContainer>
  DATABASE_URL: string
  PAYLOAD_SECRET: string
  NEXT_PUBLIC_SERVER_URL: string
  R2_BUCKET: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_ENDPOINT: string
  STORAGE_POSTGRES_URL?: string
  POSTGRES_URL_NON_POOLING?: string
  CRON_SECRET?: string
  PREVIEW_SECRET?: string
}

export class CmsContainer extends Container<Env> {
  defaultPort = 3000
  sleepAfter = '10m'

  // Use the cloudflare:workers `env` import — class-field initializers run
  // before `this.env` is available, which otherwise stringifies as "undefined".
  override envVars = {
    NODE_ENV: 'production',
    PORT: '3000',
    HOSTNAME: '0.0.0.0',
    DATABASE_URL: env.DATABASE_URL ?? '',
    PAYLOAD_SECRET: env.PAYLOAD_SECRET ?? '',
    NEXT_PUBLIC_SERVER_URL: env.NEXT_PUBLIC_SERVER_URL ?? '',
    R2_BUCKET: env.R2_BUCKET ?? '',
    R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID ?? '',
    R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY ?? '',
    R2_ENDPOINT: env.R2_ENDPOINT ?? '',
    STORAGE_POSTGRES_URL: env.STORAGE_POSTGRES_URL ?? '',
    POSTGRES_URL_NON_POOLING: env.POSTGRES_URL_NON_POOLING ?? '',
    CRON_SECRET: env.CRON_SECRET ?? '',
    PREVIEW_SECRET: env.PREVIEW_SECRET ?? '',
  }
}

export default {
  fetch(request: Request, workerEnv: Env): Promise<Response> {
    const container = workerEnv.CMS_CONTAINER.getByName('cms')
    return container.fetch(request)
  },
}
