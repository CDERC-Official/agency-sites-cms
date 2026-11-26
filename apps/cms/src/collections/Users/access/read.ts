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

  // Super admins manage every account, including users on other tenants and
  // users with no tenant. The selected-tenant cookie must not hide them.
  if (isSuperAdmin(req.user)) {
    return true
  }

  const selectedTenant = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ payload: req.payload, collectionSlug: 'tenants' }),
  )
  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')

  if (selectedTenant) {
    const hasTenantAccess = adminTenantAccessIDs.some((tenantID) => tenantID === selectedTenant)
    if (hasTenantAccess) {
      return {
        'tenants.tenant': {
          equals: selectedTenant,
        },
      }
    }
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
