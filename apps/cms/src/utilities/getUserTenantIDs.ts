import type { TypedUser } from 'payload'

import { extractID } from './extractID'

type TenantRole = 'tenant-admin' | 'tenant-viewer'

type UserWithTenants = {
  tenants?:
    | {
        roles?: TenantRole[] | null
        tenant: number | string | { id: number | string }
      }[]
    | null
} & TypedUser

/**
 * Returns array of all tenant IDs assigned to a user
 *
 * @param user - User object with tenants field
 * @param role - Optional role to filter by
 */
export const getUserTenantIDs = (
  user: null | TypedUser | undefined,
  role?: TenantRole,
): (number | string)[] => {
  if (!user) {
    return []
  }

  const tenants = (user as UserWithTenants).tenants

  return (
    tenants?.reduce<(number | string)[]>((acc, { roles, tenant }) => {
      if (role && !roles?.includes(role)) {
        return acc
      }

      if (tenant) {
        acc.push(extractID(tenant))
      }

      return acc
    }, []) || []
  )
}
