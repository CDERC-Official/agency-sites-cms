import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type TenantGlobal = 'header' | 'footer' | 'site-settings'

type DataFromTenantGlobal<T extends TenantGlobal> = Config['collections'][T]

async function getTenantGlobal<T extends TenantGlobal>(
  slug: T,
  depth = 0,
  tenantID?: number | string,
): Promise<DataFromTenantGlobal<T> | null> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: slug,
    depth,
    limit: 1,
    pagination: false,
    where: tenantID
      ? {
          tenant: {
            equals: tenantID,
          },
        }
      : undefined,
  })

  return (result.docs[0] as DataFromTenantGlobal<T> | undefined) ?? null
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug.
 * Prefer passing tenantID once frontend tenant resolution exists.
 */
export const getCachedGlobal = <T extends TenantGlobal>(
  slug: T,
  depth = 0,
  tenantID?: number | string,
) =>
  unstable_cache(async () => getTenantGlobal<T>(slug, depth, tenantID), [slug, String(tenantID ?? '')], {
    tags: [`global_${slug}`],
  })
