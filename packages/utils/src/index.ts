/** Remove trailing slashes while preserving a URL's optional base path. */
export function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

export { cn } from './cn'
export { getCmsHref, getMediaUrl } from './cms'
export type { CmsLinkFields, CmsLinkReference, CmsMediaLike } from './cms'
