import type { Access } from 'payload'

import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { extractID } from '@/utilities/extractID'

/**
 * Tenant admins and super admins are allowed access.
 * For create, checks the tenant on the incoming data.
 * For update/delete/read constrained ops, returns a tenant query constraint.
 */
export const superAdminOrTenantAdminAccess: Access = ({ req, data }) => {
  if (!req.user) {
    return false
  }

  if (isSuperAdmin(req.user)) {
    return true
  }

  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')

  if (adminTenantAccessIDs.length === 0) {
    return false
  }

  const requestedTenant = data?.tenant ? extractID(data.tenant) : undefined

  if (requestedTenant) {
    return adminTenantAccessIDs.includes(requestedTenant)
  }

  return {
    tenant: {
      in: adminTenantAccessIDs,
    },
  }
}
