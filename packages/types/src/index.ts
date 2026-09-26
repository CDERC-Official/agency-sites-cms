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
