import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'
import type { CollectionSlug, Payload, TypedUser } from 'payload'

import { getCollectionIDType } from '@/utilities/getCollectionIDType'

/** Collections registered with multi-tenant `isGlobal: true`. */
export const GLOBAL_TENANT_COLLECTION_SLUGS = [
  'header',
  'footer',
  'site-settings',
] as const satisfies readonly CollectionSlug[]

export type GlobalTenantCollectionSlug = (typeof GLOBAL_TENANT_COLLECTION_SLUGS)[number]

export type GlobalTenantDocIDs = Partial<
  Record<GlobalTenantCollectionSlug, string | number | null>
>

type Args = {
  headers: Headers
  payload: Payload
  user?: TypedUser | null
}

/**
 * Resolve the current-tenant document ID for each global-like collection so
 * admin nav can link straight to `/collections/{slug}/{id}` and skip the
 * multi-tenant list → document server redirect (which flashes a full reload).
 */
export async function getGlobalTenantDocIDs({
  headers,
  payload,
  user,
}: Args): Promise<GlobalTenantDocIDs> {
  if (!user) return {}

  const tenantID = getTenantFromCookie(
    headers,
    getCollectionIDType({ payload, collectionSlug: 'tenants' }),
  )

  const entries = await Promise.all(
    GLOBAL_TENANT_COLLECTION_SLUGS.map(async (slug) => {
      try {
        const result = await payload.find({
          collection: slug,
          depth: 0,
          limit: 1,
          overrideAccess: false,
          pagination: false,
          select: { id: true },
          user,
          where: tenantID
            ? {
                tenant: {
                  in: [tenantID],
                },
              }
            : {},
        })

        return [slug, result.docs[0]?.id ?? null] as const
      } catch {
        return [slug, null] as const
      }
    }),
  )

  return Object.fromEntries(entries)
}
