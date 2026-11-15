import type { FieldHook } from 'payload'

import type { User } from '@/payload-types'

/**
 * The first user created via /admin must be a super-admin so multi-tenant
 * access control does not lock them out of tenant-scoped collections.
 */
export const ensureFirstUserIsSuperAdmin: FieldHook<User, User['roles']> = async ({
  operation,
  req,
  value,
}) => {
  if (operation !== 'create') {
    return value
  }

  const users = await req.payload.find({
    collection: 'users',
    depth: 0,
    limit: 0,
    overrideAccess: true,
  })

  if (users.totalDocs === 0 && !(value || []).includes('super-admin')) {
    return [...(value || []), 'super-admin']
  }

  return value
}
