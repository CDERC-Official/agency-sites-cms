import type { PaginatedResult, Tenant } from '@liskof-digital/types'
import { normalizeBaseUrl } from '@liskof-digital/utils'
import { $fetch } from 'ofetch'

export function normalizeHostname(host: string): string {
  return host.trim().toLowerCase().split(':')[0] ?? ''
}

export async function fetchTenantByDomain(
  domain: string,
  options: { payloadUrl: string; apiToken?: string },
): Promise<Tenant | null> {
  if (!domain) return null

  const baseUrl = normalizeBaseUrl(options.payloadUrl)
  const headers: HeadersInit | undefined = options.apiToken
    ? { Authorization: `users API-Key ${options.apiToken}` }
    : undefined

  const result = await $fetch<PaginatedResult<Tenant>>(`${baseUrl}/api/tenants`, {
    headers,
    query: {
      depth: 0,
      limit: 1,
      'where[domain][equals]': domain,
      'select[id]': 'true',
      'select[name]': 'true',
      'select[domain]': 'true',
      'select[slug]': 'true',
      'select[allowPublicRead]': 'true',
      'select[enabledCollections]': 'true',
      'select[enabledLocales]': 'true',
      'select[defaultLocale]': 'true',
      'select[showLanguageSwitcher]': 'true',
    },
  })

  return result.docs[0] ?? null
}
