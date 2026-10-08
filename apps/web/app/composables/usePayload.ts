import type { CmsPage, CmsPost, CmsCategory, PayloadQuery } from '@liskof-digital/types'
import { findBySlug, findCollection } from '~/utils/payload'

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
  function getPages(query: PayloadQuery = {}) {
    return findCollection<CmsPage>('pages', {
      sort: 'title',
      select: listSelect,
      ...query,
    })
  }

  function getPosts(query: PayloadQuery = {}) {
    return findCollection<CmsPost>('posts', {
      sort: '-publishedAt',
      select: listSelect,
      ...query,
    })
  }

  function getCategories(query: PayloadQuery = {}) {
    return findCollection<CmsCategory>('categories', {
      sort: 'title',
      select: {
        id: true,
        title: true,
        slug: true,
      },
      ...query,
    })
  }

  function getPageBySlug(slug: string, query: PayloadQuery = {}) {
    return findBySlug<CmsPage>('pages', slug, {
      depth: 2,
      select: pageDetailSelect,
      ...query,
    })
  }

  function getPostBySlug(slug: string, query: PayloadQuery = {}) {
    return findBySlug<CmsPost>('posts', slug, {
      depth: 2,
      select: {
        ...listSelect,
        content: true,
        categories: true,
        heroImage: true,
      },
      ...query,
    })
  }

  return {
    getPages,
    getPosts,
    getCategories,
    getPageBySlug,
    getPostBySlug,
  }
}
