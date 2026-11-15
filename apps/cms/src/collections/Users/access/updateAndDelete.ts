import type { Access } from 'payload'

import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

import { isAccessingSelf } from './isAccessingSelf'

export const updateAndDeleteAccess: Access = ({ req, id }) => {
  const { user } = req

  if (!user) {
    return false
  }

  if (isSuperAdmin(user) || isAccessingSelf({ user, id })) {
    return true
  }

  return {
    'tenants.tenant': {
      in: getUserTenantIDs(user, 'tenant-admin'),
    },
  }
}
