import type { Access, AccessArgs, AccessResult, Where } from 'payload'

import { isSuperAdmin } from '@/access/isSuperAdmin'
import { extractID } from '@/utilities/extractID'
import type { OptionalTenantCollectionSlug } from '@/utilities/optionalTenantCollections'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

type TenantDoc = {
  id: number | string
  enabledCollections?: OptionalTenantCollectionSlug[] | null
}

async function getTenantIDsWithCollectionEnabled({
  req,
  collectionSlug,
  candidateIDs,
}: {
  req: AccessArgs['req']
  collectionSlug: OptionalTenantCollectionSlug
  candidateIDs?: (number | string)[]
}): Promise<(number | string)[]> {
  const where: Where = {
    and: [
      {
        enabledCollections: {
          contains: collectionSlug,
        },
      },
      ...(candidateIDs && candidateIDs.length > 0
        ? [
            {
              id: {
                in: candidateIDs,
              },
            } satisfies Where,
          ]
        : []),
    ],
  }

  // Access-control lookup: must see all tenants, not only allowPublicRead ones.
  const result = await req.payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where,
  })

  return result.docs.map((doc) => doc.id)
}

async function tenantHasCollectionEnabled({
  req,
  tenantID,
  collectionSlug,
}: {
  req: AccessArgs['req']
  tenantID: number | string
  collectionSlug: OptionalTenantCollectionSlug
}): Promise<boolean> {
  try {
    const tenant = (await req.payload.findByID({
      id: tenantID,
      collection: 'tenants',
      depth: 0,
      overrideAccess: true,
      select: { enabledCollections: true },
    })) as TenantDoc

    return Boolean(tenant.enabledCollections?.includes(collectionSlug))
  } catch {
    return false
  }
}

function tenantInConstraint(enabledIDs: (number | string)[]): AccessResult {
  return {
    tenant: {
      in: enabledIDs,
    },
  }
}

/**
 * Access for optional per-tenant collections.
 * Create/update/delete require tenant-admin (or super-admin) and the target
 * tenant must include `collectionSlug` in `enabledCollections`.
 * Read returns a tenant constraint to enabled tenants; compose with draft/publish
 * access separately when needed.
 */
export function tenantCollectionEnabledAccess(
  collectionSlug: OptionalTenantCollectionSlug,
): {
  create: Access
  read: Access
  update: Access
  delete: Access
} {
  const create: Access = async ({ req, data }) => {
    if (!req.user) return false

    if (isSuperAdmin(req.user)) {
      const requestedTenant = data?.tenant ? extractID(data.tenant) : undefined
      if (!requestedTenant) return true
      return tenantHasCollectionEnabled({ req, tenantID: requestedTenant, collectionSlug })
    }

    const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')
    if (adminTenantAccessIDs.length === 0) return false

    const requestedTenant = data?.tenant ? extractID(data.tenant) : undefined
    if (requestedTenant) {
      if (!adminTenantAccessIDs.includes(requestedTenant)) return false
      return tenantHasCollectionEnabled({ req, tenantID: requestedTenant, collectionSlug })
    }

    const enabledIDs = await getTenantIDsWithCollectionEnabled({
      req,
      collectionSlug,
      candidateIDs: adminTenantAccessIDs,
    })

    return enabledIDs.length > 0
  }

  const updateOrDelete: Access = async ({ req, data }) => {
    if (!req.user) return false

    if (isSuperAdmin(req.user)) {
      const requestedTenant = data?.tenant ? extractID(data.tenant) : undefined
      if (requestedTenant) {
        return tenantHasCollectionEnabled({
          req,
          tenantID: requestedTenant,
          collectionSlug,
        })
      }

      const enabledIDs = await getTenantIDsWithCollectionEnabled({ req, collectionSlug })
      if (enabledIDs.length === 0) return false
      return tenantInConstraint(enabledIDs)
    }

    const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')
    if (adminTenantAccessIDs.length === 0) return false

    const requestedTenant = data?.tenant ? extractID(data.tenant) : undefined
    if (requestedTenant) {
      if (!adminTenantAccessIDs.includes(requestedTenant)) return false
      return tenantHasCollectionEnabled({ req, tenantID: requestedTenant, collectionSlug })
    }

    const enabledIDs = await getTenantIDsWithCollectionEnabled({
      req,
      collectionSlug,
      candidateIDs: adminTenantAccessIDs,
    })

    if (enabledIDs.length === 0) return false

    return tenantInConstraint(enabledIDs)
  }

  const read: Access = async ({ req }): Promise<AccessResult> => {
    if (req.user) {
      if (isSuperAdmin(req.user)) {
        const enabledIDs = await getTenantIDsWithCollectionEnabled({ req, collectionSlug })
        if (enabledIDs.length === 0) return false
        return tenantInConstraint(enabledIDs)
      }

      const userTenantIDs = getUserTenantIDs(req.user)
      if (userTenantIDs.length === 0) return false

      const enabledIDs = await getTenantIDsWithCollectionEnabled({
        req,
        collectionSlug,
        candidateIDs: userTenantIDs,
      })

      if (enabledIDs.length === 0) return false

      return tenantInConstraint(enabledIDs)
    }

    const enabledIDs = await getTenantIDsWithCollectionEnabled({ req, collectionSlug })
    if (enabledIDs.length === 0) return false

    return {
      and: [
        {
          tenant: {
            in: enabledIDs,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    }
  }

  return {
    create,
    read,
    update: updateOrDelete,
    delete: updateOrDelete,
  }
}
