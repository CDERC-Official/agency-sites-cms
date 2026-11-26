import type {
  CmsPage,
  CmsPost,
  CmsEvent,
  CmsCategory,
  CmsHeader,
  CmsFooter,
  CmsSiteSettings,
  PayloadQuery,
} from '@liskof-digital/types'
import { DEFAULT_CMS_LOCALE } from '@liskof-digital/types'
import { findBySlug, findCollection, mergeWhere } from '~/utils/payload'

const listSelect = {
  id: true,
  title: true,
  slug: true,
  publishedAt: true,
  meta: true,
  _status: true,
} as const

const eventListSelect = {
  id: true,
  title: true,
  slug: true,
  startDate: true,
  endDate: true,
  allDay: true,
  isRecurring: true,
  frequency: true,
  interval: true,
  ends: true,
  until: true,
  count: true,
  location: true,
  publishedAt: true,
  meta: true,
  _status: true,
} as const

const pageDetailSelect = {
  id: true,
  title: true,
  slug: true,
  publishedAt: true,
  meta: true,
  hero: true,
  layout: true,
  _status: true,
} as const

export function usePayload() {
  const { tenantId } = useTenant()
  const { locale } = useLocale()

  function scopedQuery(query: PayloadQuery = {}): PayloadQuery {
    const withLocale: PayloadQuery = {
      locale: locale.value || DEFAULT_CMS_LOCALE,
      ...query,
    }

    if (!tenantId.value) return withLocale

    return {
      ...withLocale,
      where: mergeWhere(withLocale.where, {
        tenant: {
          equals: tenantId.value,
        },
      }),
    }
  }

  function getPages(query: PayloadQuery = {}) {
    return findCollection<CmsPage>(
      'pages',
      scopedQuery({
        sort: 'title',
        select: listSelect,
        ...query,
      }),
    )
  }

  function getPosts(query: PayloadQuery = {}) {
    return findCollection<CmsPost>(
      'posts',
      scopedQuery({
        sort: '-publishedAt',
        select: listSelect,
        ...query,
      }),
    )
  }

  function getCategories(query: PayloadQuery = {}) {
    return findCollection<CmsCategory>(
      'categories',
      scopedQuery({
        sort: 'title',
        select: {
          id: true,
          title: true,
          slug: true,
        },
        ...query,
      }),
    )
  }

  function getPageBySlug(slug: string, query: PayloadQuery = {}) {
    return findBySlug<CmsPage>(
      'pages',
      slug,
      scopedQuery({
        depth: 2,
        select: pageDetailSelect,
        ...query,
      }),
    )
  }

  function getPostBySlug(slug: string, query: PayloadQuery = {}) {
    return findBySlug<CmsPost>(
      'posts',
      slug,
      scopedQuery({
        depth: 2,
        select: {
          ...listSelect,
          content: true,
          categories: true,
          heroImage: true,
        },
        ...query,
      }),
    )
  }

  function getEvents(query: PayloadQuery = {}) {
    return findCollection<CmsEvent>(
      'events',
      scopedQuery({
        sort: 'startDate',
        select: eventListSelect,
        ...query,
      }),
    )
  }

  function getEventBySlug(slug: string, query: PayloadQuery = {}) {
    return findBySlug<CmsEvent>(
      'events',
      slug,
      scopedQuery({
        depth: 2,
        select: {
          ...eventListSelect,
          content: true,
          heroImage: true,
        },
        ...query,
      }),
    )
  }

  async function getTenantGlobal<T>(
    collection: string,
    query: PayloadQuery = {},
  ): Promise<T | null> {
    const result = await findCollection<T>(
      collection,
      scopedQuery({
        depth: 1,
        limit: 1,
        pagination: false,
        ...query,
      }),
    )
    return result.docs[0] ?? null
  }

  function getHeader(query: PayloadQuery = {}) {
    return getTenantGlobal<CmsHeader>('header', {
      depth: 1,
      ...query,
    })
  }

  function getFooter(query: PayloadQuery = {}) {
    return getTenantGlobal<CmsFooter>('footer', {
      depth: 1,
      ...query,
    })
  }

  function getSiteSettings(query: PayloadQuery = {}) {
    return getTenantGlobal<CmsSiteSettings>('site-settings', {
      depth: 1,
      ...query,
    })
  }

  return {
    getPages,
    getPosts,
    getEvents,
    getCategories,
    getPageBySlug,
    getPostBySlug,
    getEventBySlug,
    getHeader,
    getFooter,
    getSiteSettings,
  }
}
