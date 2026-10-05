import type { PaginatedResult, PayloadQuery } from '@liskof-digital/types'
import { normalizeBaseUrl } from '@liskof-digital/utils'

function getPayloadConfig() {
  const config = useRuntimeConfig()
  return {
    baseUrl: normalizeBaseUrl(config.public.payloadUrl),
    apiToken: config.payloadApiToken as string,
  }
}

function buildHeaders(apiToken: string): HeadersInit | undefined {
  if (!apiToken) return undefined
  return {
    Authorization: `users API-Key ${apiToken}`,
  }
}

function toSearchParams(query: PayloadQuery = {}): Record<string, string> {
  const params: Record<string, string> = {}

  if (query.depth !== undefined) params.depth = String(query.depth)
  if (query.limit !== undefined) params.limit = String(query.limit)
  if (query.page !== undefined) params.page = String(query.page)
  if (query.sort) params.sort = query.sort

  if (query.where) {
    flattenWhere(query.where, 'where', params)
  }

  if (query.select) {
    for (const [field, include] of Object.entries(query.select)) {
      if (include) params[`select[${field}]`] = 'true'
    }
  }

  return params
}

function flattenWhere(
  value: unknown,
  prefix: string,
  params: Record<string, string>,
): void {
  if (value === null || value === undefined) return

  if (typeof value !== 'object' || Array.isArray(value)) {
    params[prefix] = String(value)
    return
  }

  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    flattenWhere(nested, `${prefix}[${key}]`, params)
  }
}

export async function findCollection<T>(
  collection: string,
  query: PayloadQuery = {},
): Promise<PaginatedResult<T>> {
  const { baseUrl, apiToken } = getPayloadConfig()

  return $fetch<PaginatedResult<T>>(`${baseUrl}/api/${collection}`, {
    headers: buildHeaders(apiToken),
    query: toSearchParams({
      depth: 1,
      limit: 100,
      ...query,
    }),
  })
}

export async function findBySlug<T>(
  collection: string,
  slug: string,
  query: PayloadQuery = {},
): Promise<T | null> {
  const result = await findCollection<T>(collection, {
    ...query,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0] ?? null
}

export async function findGlobal<T>(slug: string, query: PayloadQuery = {}): Promise<T> {
  const { baseUrl, apiToken } = getPayloadConfig()

  return $fetch<T>(`${baseUrl}/api/globals/${slug}`, {
    headers: buildHeaders(apiToken),
    query: toSearchParams({
      depth: 1,
      ...query,
    }),
  })
}
