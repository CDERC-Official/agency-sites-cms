import { NavHamburger, NavWrapper } from '@payloadcms/next/client'
import { Logout } from '@payloadcms/ui'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { EntityType, groupNavItems } from '@payloadcms/ui/shared'
import type { NavPreferences, ServerProps } from 'payload'
import { PREFERENCE_KEYS } from 'payload/shared'
import { cache } from 'react'
import React from 'react'

import { AgencyNavClient } from './AgencyNavClient'

const baseClass = 'nav'

const getNavPrefs = cache(async (req: ServerProps['req']): Promise<NavPreferences | null> => {
  if (!req?.user?.collection) return null

  const result = await req.payload.find({
    collection: 'payload-preferences',
    depth: 0,
    limit: 1,
    pagination: false,
    req,
    where: {
      and: [
        { key: { equals: PREFERENCE_KEYS.NAV } },
        { 'user.relationTo': { equals: req.user.collection } },
        { 'user.value': { equals: req.user.id } },
      ],
    },
  })

  return (result?.docs?.[0]?.value as NavPreferences | undefined) ?? null
})

export async function AgencyNav(props: ServerProps) {
  const {
    documentSubViewType,
    i18n,
    locale,
    params,
    payload,
    permissions,
    req,
    searchParams,
    user,
    viewType,
    visibleEntities,
  } = props

  if (!payload?.config || !visibleEntities || !permissions || !i18n) {
    return null
  }

  const {
    admin: {
      components: {
        afterNav,
        afterNavLinks,
        beforeNav,
        beforeNavLinks,
        logout,
      } = {},
    },
    collections,
    globals,
  } = payload.config

  const groups = groupNavItems(
    [
      ...collections
        .filter(({ slug }) => visibleEntities.collections.includes(slug))
        .map((collection) => ({
          type: EntityType.collection,
          entity: collection,
        })),
      ...globals
        .filter(({ slug }) => visibleEntities.globals.includes(slug))
        .map((global) => ({
          type: EntityType.global,
          entity: global,
        })),
    ],
    permissions,
    i18n,
  )

  const navPreferences = await getNavPrefs(req)

  const sharedServerProps = {
    i18n,
    locale,
    params,
    payload,
    permissions,
    searchParams,
    user,
  }

  const LogoutComponent = RenderServerComponent({
    clientProps: {
      documentSubViewType,
      viewType,
    },
    Component: logout?.Button,
    Fallback: Logout,
    importMap: payload.importMap,
    serverProps: sharedServerProps,
  })

  const RenderedBeforeNav = RenderServerComponent({
    clientProps: { documentSubViewType, viewType },
    Component: beforeNav,
    importMap: payload.importMap,
    serverProps: sharedServerProps,
  })

  const RenderedBeforeNavLinks = RenderServerComponent({
    clientProps: { documentSubViewType, viewType },
    Component: beforeNavLinks,
    importMap: payload.importMap,
    serverProps: sharedServerProps,
  })

  const RenderedAfterNavLinks = RenderServerComponent({
    clientProps: { documentSubViewType, viewType },
    Component: afterNavLinks,
    importMap: payload.importMap,
    serverProps: sharedServerProps,
  })

  const RenderedAfterNav = RenderServerComponent({
    clientProps: { documentSubViewType, viewType },
    Component: afterNav,
    importMap: payload.importMap,
    serverProps: sharedServerProps,
  })

  return (
    <NavWrapper baseClass={baseClass}>
      {RenderedBeforeNav}
      <nav className={`${baseClass}__wrap`}>
        {RenderedBeforeNavLinks}
        <AgencyNavClient groups={groups} navPreferences={navPreferences} />
        {RenderedAfterNavLinks}
        <div className={`${baseClass}__controls`}>{LogoutComponent}</div>
      </nav>
      {RenderedAfterNav}
      <div className={`${baseClass}__header`}>
        <div className={`${baseClass}__header-content`}>
          <NavHamburger baseClass={baseClass} />
        </div>
      </div>
    </NavWrapper>
  )
}

export default AgencyNav
