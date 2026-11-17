import type { Tenant } from '@liskof-digital/types'
import { fetchTenantByDomain, normalizeHostname } from '../../shared/tenant'

export { normalizeHostname }

export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  const config = useRuntimeConfig()

  return fetchTenantByDomain(domain, {
    payloadUrl: config.public.payloadUrl as string,
    apiToken: config.payloadApiToken as string | undefined,
  })
}
