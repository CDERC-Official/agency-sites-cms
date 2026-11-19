import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'
import { NavHamburger, NavWrapper } from '@payloadcms/next/client'
import { Logout } from '@payloadcms/ui'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { EntityType, groupNavItems } from '@payloadcms/ui/shared'
import { headers as getHeaders } from 'next/headers'
import type { NavPreferences, Payload, ServerProps, TypedUser } from 'payload'
import { PREFERENCE_KEYS } from 'payload/shared'
import { cache } from 'react'
import React from 'react'

import { getCollectionIDType } from '@/utilities/getCollectionIDType'
import { getGlobalTenantDocIDs } from '@/utilities/getGlobalTenantDocIDs'
import {
  isOptionalTenantCollection,
  type OptionalTenantCollectionSlug,
} from '@/utilities/optionalTenantCollections'

import { AgencyNavClient } from './AgencyNavClient'

const baseClass = 'nav'

const getNavPrefs = cache(
  async ({
    payload,
    user,
  }: {
    payload: Payload
    user?: TypedUser | null
  }): Promise<NavPreferences | null> => {
    if (!user?.collection) return null

    const result = await payload.find({
      collection: 'payload-preferences',
      depth: 0,
      limit: 1,
      pagination: false,
      where: {
        and: [
          { key: { equals: PREFERENCE_KEYS.NAV } },
          { 'user.relationTo': { equals: user.collection } },
          { 'user.value': { equals: user.id } },
        ],
      },
    })

    return (result?.docs?.[0]?.value as NavPreferences | undefined) ?? null
  },
)

const getEnabledOptionalCollectionsForSelectedTenant = cache(
  async ({
    headers,
    payload,
    user,
  }: {
    headers: Headers
    payload: Payload
    user?: TypedUser | null
  }): Promise<Set<OptionalTenantCollectionSlug>> => {
    if (!user) return new Set()

    const tenantID = getTenantFromCookie(
      headers,
      getCollectionIDType({ payload, collectionSlug: 'tenants' }),
    )

    if (!tenantID) return new Set()

    try {
      const tenant = await payload.findByID({
        id: tenantID,
        collection: 'tenants',
        depth: 0,
        overrideAccess: false,
        select: { enabledCollections: true },
        user,
      })

      return new Set(
        (tenant.enabledCollections ?? []).filter(isOptionalTenantCollection),
      )
    } catch {
      return new Set()
    }
  },
)

export async function AgencyNav(props: ServerProps) {
  const {
    documentSubViewType,
    i18n,
    locale,
    params,
    payload,
    permissions,
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

  const requestHeaders = await getHeaders()
  const enabledOptionalCollections = await getEnabledOptionalCollectionsForSelectedTenant({
    headers: requestHeaders,
    payload,
    user,
  })

  const groups = groupNavItems(
    [
      ...collections
        .filter(({ slug }) => visibleEntities.collections.includes(slug))
        .filter(({ slug }) => {
          if (!isOptionalTenantCollection(slug)) return true
          return enabledOptionalCollections.has(slug)
        })
        .map((collection) => ({
          type: EntityType.collection as const,
          entity: collection,
        })),
      ...(globals ?? [])
        .filter(({ slug }) => visibleEntities.globals.includes(slug))
        .map((global) => ({
          type: EntityType.global as const,
          entity: global,
        })),
    ],
    permissions,
    i18n,
  )

  const navPreferences = await getNavPrefs({ payload, user })
  const globalDocIDs = await getGlobalTenantDocIDs({
    headers: requestHeaders,
    payload,
    user,
  })

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
        <AgencyNavClient
          globalDocIDs={globalDocIDs}
          groups={groups}
          navPreferences={navPreferences}
        />
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
