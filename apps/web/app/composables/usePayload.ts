import type { CmsPage, CmsPost, CmsCategory, PayloadQuery } from '@liskof-digital/types'
import { findBySlug, findCollection, mergeWhere } from '~/utils/payload'

const listSelect = {
  id: true,
  title: true,
  slug: true,
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

  function scopedQuery(query: PayloadQuery = {}): PayloadQuery {
    if (!tenantId.value) return query

    return {
      ...query,
      where: mergeWhere(query.where, {
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

  return {
    getPages,
    getPosts,
    getCategories,
    getPageBySlug,
    getPostBySlug,
  }
}
