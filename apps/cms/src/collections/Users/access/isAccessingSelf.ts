import type { User } from '@/payload-types'

export const isAccessingSelf = ({
  id,
  user,
}: {
  id?: number | string
  user?: User | null
}): boolean => {
  return user ? Boolean(user.id === id) : false
}
