import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header as HeaderType } from '@/payload-types'
import React from 'react'

export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()

  return <HeaderClient data={headerData ?? ({ id: 0, navItems: [], updatedAt: '', createdAt: '' } as HeaderType)} />
}
