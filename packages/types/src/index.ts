export interface SiteConfig {
  name: string
  description: string
}

export interface PaginatedResult<T> {
  docs: T[]
  totalDocs: number
  limit: number
  page: number | null
  totalPages: number
}

export interface CmsMeta {
  title?: string | null
  description?: string | null
}

export interface CmsPage {
  id: number
  title: string
  slug: string
  publishedAt?: string | null
  meta?: CmsMeta | null
  _status?: ('draft' | 'published') | null
}

export interface CmsPost {
  id: number
  title: string
  slug: string
  publishedAt?: string | null
  meta?: CmsMeta | null
  _status?: ('draft' | 'published') | null
}

export interface CmsCategory {
  id: number
  title: string
  slug: string
}

export interface PayloadQuery {
  depth?: number
  limit?: number
  page?: number
  sort?: string
  where?: Record<string, unknown>
  select?: Record<string, boolean>
}
