import type { Access } from 'payload'

import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

export const createAccess: Access = ({ req }) => {
  if (!req.user) {
    return false
  }

  if (isSuperAdmin(req.user)) {
    return true
  }

  if (req.data?.roles?.includes('super-admin')) {
    return false
  }

  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')

  const requestedTenants: (number | string)[] =
    req.data?.tenants?.map((t: { tenant: number | string }) => t.tenant) ?? []

  const hasAccessToAllRequestedTenants = requestedTenants.every((tenantID) =>
    adminTenantAccessIDs.includes(tenantID),
  )

  return hasAccessToAllRequestedTenants && requestedTenants.length > 0
}
