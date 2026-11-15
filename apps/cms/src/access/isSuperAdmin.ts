import type { Access, TypedUser } from 'payload'

type UserWithRoles = {
  roles?: ('super-admin' | 'user' | null)[] | null
} & TypedUser

export const isSuperAdminAccess: Access = ({ req }): boolean => {
  return isSuperAdmin(req.user)
}

export const isSuperAdmin = (user: null | TypedUser | undefined): boolean => {
  return Boolean((user as UserWithRoles | null | undefined)?.roles?.includes('super-admin'))
}
