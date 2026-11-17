'use client'

import { BrowseByFolderButton, Link, NavGroup, useConfig } from '@payloadcms/ui'
import { EntityType } from '@payloadcms/ui/shared'
import { usePathname } from 'next/navigation'
import type { NavPreferences, StaticLabel } from 'payload'
import { formatAdminURL } from 'payload/shared'
import React, { Fragment } from 'react'

import {
  GLOBAL_TENANT_COLLECTION_SLUGS,
  type GlobalTenantDocIDs,
} from '@/utilities/getGlobalTenantDocIDs'

import { navIcons } from './navIcons'

type NavEntity = {
  label: StaticLabel
  slug: string
  type: EntityType
}

type NavGroupItem = {
  entities: NavEntity[]
  label: string
}

type AgencyNavClientProps = {
  globalDocIDs?: GlobalTenantDocIDs
  groups: NavGroupItem[]
  navPreferences?: NavPreferences | null
}

const baseClass = 'nav'

const globalSlugSet = new Set<string>(GLOBAL_TENANT_COLLECTION_SLUGS)

function resolveLabel(label: StaticLabel): string {
  if (typeof label === 'string') return label
  if (label && typeof label === 'object') {
    return label.en || Object.values(label)[0] || ''
  }
  return ''
}

function collectionPath(slug: string, globalDocIDs?: GlobalTenantDocIDs): string {
  if (!globalSlugSet.has(slug)) {
    return `/collections/${slug}`
  }

  const docID = globalDocIDs?.[slug as keyof GlobalTenantDocIDs]
  if (docID != null) {
    return `/collections/${slug}/${docID}`
  }

  return `/collections/${slug}/create`
}

export function AgencyNavClient({
  globalDocIDs,
  groups,
  navPreferences,
}: AgencyNavClientProps) {
  const pathname = usePathname()
  const {
    config: {
      admin: {
        routes: { browseByFolder: foldersRoute },
      },
      folders,
      routes: { admin: adminRoute },
    },
  } = useConfig()

  const folderURL = formatAdminURL({
    adminRoute,
    path: foldersRoute,
  })
  const viewingRootFolderView = pathname.startsWith(folderURL)

  return (
    <Fragment>
      {folders && folders.browseByFolder && (
        <BrowseByFolderButton active={viewingRootFolderView} />
      )}
      {groups.map(({ entities, label }, key) => (
        <NavGroup isOpen={navPreferences?.groups?.[label]?.open} key={key} label={label}>
          {entities.map(({ slug, type, label: entityLabel }, i) => {
            const path =
              type === EntityType.collection
                ? collectionPath(slug, globalDocIDs)
                : `/globals/${slug}`
            const href = formatAdminURL({
              adminRoute,
              path,
            })
            const id =
              type === EntityType.collection ? `nav-${slug}` : `nav-global-${slug}`
            const collectionRoot = formatAdminURL({
              adminRoute,
              path: `/collections/${slug}`,
            })
            const isActive = globalSlugSet.has(slug)
              ? pathname === href ||
                pathname.startsWith(`${href}/`) ||
                pathname.startsWith(`${collectionRoot}/`)
              : pathname.startsWith(href) && ['/', undefined].includes(pathname[href.length])
            const Icon = navIcons[slug]

            const Label = (
              <Fragment>
                {isActive && <div className={`${baseClass}__link-indicator`} />}
                {Icon ? (
                  <Icon aria-hidden className={`${baseClass}__link-icon`} />
                ) : null}
                <span className={`${baseClass}__link-label`}>{resolveLabel(entityLabel)}</span>
              </Fragment>
            )

            if (pathname === href) {
              return (
                <div className={`${baseClass}__link`} id={id} key={i}>
                  {Label}
                </div>
              )
            }

            return (
              <Link className={`${baseClass}__link`} href={href} id={id} key={i} prefetch={false}>
                {Label}
              </Link>
            )
          })}
        </NavGroup>
      ))}
    </Fragment>
  )
}
