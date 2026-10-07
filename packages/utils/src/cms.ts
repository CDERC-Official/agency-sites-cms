export type CmsLinkReference = {
  relationTo?: 'pages' | 'posts' | null
  value?:
    | {
        slug?: string | null
      }
    | string
    | number
    | null
} | null

export type CmsLinkFields = {
  type?: ('reference' | 'custom') | null
  url?: string | null
  reference?: CmsLinkReference
}

/** Resolve a Payload CMS link field to a frontend href. */
export function getCmsHref(link?: CmsLinkFields | null): string | null {
  if (!link) return null

  if (link.type === 'reference' && link.reference) {
    const value = link.reference.value
    if (typeof value === 'object' && value?.slug) {
      const slug = value.slug
      return link.reference.relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
    }
    return null
  }

  return link.url ?? null
}

export type CmsMediaLike = {
  url?: string | null
  thumbnailURL?: string | null
  sizes?: Record<string, { url?: string | null } | null | undefined> | null
} | null

/** Build an absolute media URL from Payload media + CMS base URL. */
export function getMediaUrl(
  media: CmsMediaLike | number | string | null | undefined,
  baseUrl: string,
  size?: string,
): string | null {
  if (!media || typeof media === 'number' || typeof media === 'string') return null

  const sized = size ? media.sizes?.[size]?.url : undefined
  const path = sized || media.url || media.thumbnailURL
  if (!path) return null

  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = baseUrl.replace(/\/+$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
