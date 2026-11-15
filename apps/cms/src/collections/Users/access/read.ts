import type { Access, Where } from 'payload'
import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'

import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getCollectionIDType } from '@/utilities/getCollectionIDType'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

import { isAccessingSelf } from './isAccessingSelf'

export const readAccess: Access = ({ req, id }) => {
  if (!req?.user) {
    return false
  }

  if (isAccessingSelf({ id, user: req.user })) {
    return true
  }

  const superAdmin = isSuperAdmin(req.user)
  const selectedTenant = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ payload: req.payload, collectionSlug: 'tenants' }),
  )
  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')

  if (selectedTenant) {
    const hasTenantAccess = adminTenantAccessIDs.some((tenantID) => tenantID === selectedTenant)
    if (superAdmin || hasTenantAccess) {
      return {
        'tenants.tenant': {
          equals: selectedTenant,
        },
      }
    }
  }

  if (superAdmin) {
    return true
  }

  return {
    or: [
      {
        id: {
          equals: req.user.id,
        },
      },
      {
        'tenants.tenant': {
          in: adminTenantAccessIDs,
        },
      },
    ],
  } as Where
}
