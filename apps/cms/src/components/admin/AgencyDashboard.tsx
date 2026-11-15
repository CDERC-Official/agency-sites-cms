import React from 'react'
import type { ServerProps } from 'payload'

import type { Page, Post, User } from '@/payload-types'

import { OverviewStats, type OverviewStat } from './OverviewStats'
import { QuickActions } from './QuickActions'
import { RecentContent, type RecentContentItem } from './RecentContent'
import { WelcomeHeader } from './WelcomeHeader'
import './admin.css'

const actions = [
  { label: 'Create a page', href: '/admin/collections/pages' },
  { label: 'Upload media', href: '/admin/collections/media' },
  { label: 'Manage posts', href: '/admin/collections/posts' },
  { label: 'Site settings', href: '/admin/collections/site-settings' },
]

function getGreeting(name?: string | null) {
  const hour = new Date().getHours()
  const timeOfDay =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return name?.trim() ? `${timeOfDay}, ${name.trim()}!` : `${timeOfDay}!`
}

function toStatus(status?: string | null): RecentContentItem['status'] {
  return status === 'published' ? 'Published' : 'Draft'
}

function mapRecentDocs(
  docs: Array<Pick<Page | Post, 'id' | 'title' | '_status' | 'updatedAt'>>,
  type: string,
  collection: 'pages' | 'posts',
): RecentContentItem[] {
  return docs.map((doc) => ({
    id: `${collection}-${doc.id}`,
    title: doc.title,
    type,
    status: toStatus(doc._status),
    href: `/admin/collections/${collection}/${doc.id}`,
    updatedAt: doc.updatedAt,
  }))
}

const emptyFindResult = {
  docs: [] as Array<Pick<Page | Post, 'id' | 'title' | '_status' | 'updatedAt'>>,
  totalDocs: 0,
}

async function safeFind<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    // Multi-tenant access returns Forbidden when the user has no roles/tenants.
    // Keep the admin dashboard usable instead of crashing the whole view.
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      (error as { status?: number }).status === 403
    ) {
      return fallback
    }

    throw error
  }
}

export async function AgencyDashboard({ payload, user }: ServerProps) {
  const access = {
    overrideAccess: false as const,
    user: user as User | undefined,
  }

  const [
    publishedPages,
    categories,
    publishedPosts,
    media,
    recentPages,
    recentPosts,
  ] = await Promise.all([
    safeFind(
      () =>
        payload.find({
          collection: 'pages',
          where: { _status: { equals: 'published' } },
          limit: 0,
          depth: 0,
          ...access,
        }),
      emptyFindResult,
    ),
    safeFind(
      () =>
        payload.find({
          collection: 'categories',
          limit: 0,
          depth: 0,
          ...access,
        }),
      emptyFindResult,
    ),
    safeFind(
      () =>
        payload.find({
          collection: 'posts',
          where: { _status: { equals: 'published' } },
          limit: 0,
          depth: 0,
          ...access,
        }),
      emptyFindResult,
    ),
    safeFind(
      () =>
        payload.find({
          collection: 'media',
          limit: 0,
          depth: 0,
          ...access,
        }),
      emptyFindResult,
    ),
    safeFind(
      () =>
        payload.find({
          collection: 'pages',
          draft: true,
          limit: 4,
          sort: '-updatedAt',
          depth: 0,
          select: {
            title: true,
            _status: true,
            updatedAt: true,
          },
          ...access,
        }),
      emptyFindResult,
    ),
    safeFind(
      () =>
        payload.find({
          collection: 'posts',
          draft: true,
          limit: 4,
          sort: '-updatedAt',
          depth: 0,
          select: {
            title: true,
            _status: true,
            updatedAt: true,
          },
          ...access,
        }),
      emptyFindResult,
    ),
  ])

  const overview: OverviewStat[] = [
    {
      label: 'Published pages',
      value: String(publishedPages.totalDocs),
      detail: 'Website content',
    },
    {
      label: 'Categories',
      value: String(categories.totalDocs),
      detail: 'Content groups',
    },
    {
      label: 'Published articles',
      value: String(publishedPosts.totalDocs),
      detail: 'News and updates',
    },
    {
      label: 'Media files',
      value: String(media.totalDocs),
      detail: 'Images and documents',
    },
  ]

  const activity = [
    ...mapRecentDocs(recentPages.docs, 'Page', 'pages'),
    ...mapRecentDocs(recentPosts.docs, 'Post', 'posts'),
  ]
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? 0).getTime() -
        new Date(a.updatedAt ?? 0).getTime(),
    )
    .slice(0, 5)

  return (
    <main className="agency-dashboard">
      <WelcomeHeader greeting={getGreeting((user as User | undefined)?.name)} />
      <OverviewStats items={overview} />

      <div className="agency-dashboard__columns">
        <RecentContent items={activity} />
        <QuickActions actions={actions} />
      </div>
    </main>
  )
}

export default AgencyDashboard
