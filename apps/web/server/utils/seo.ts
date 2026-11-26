import type { H3Event } from 'h3'
import type { Tenant } from '@liskof-digital/types'
import { tenantHasCollection } from '@liskof-digital/types'
import { findCollection, mergeWhere } from '../../app/utils/payload'

export type SitemapEntry = {
  loc: string
  lastmod?: string
}

type SitemapDoc = {
  slug?: string | null
  updatedAt?: string | null
}

export function getSiteOrigin(event: H3Event): string {
  return getRequestURL(event).origin
}

export function requireTenant(event: H3Event): Tenant {
  const tenant = event.context.tenant
  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Unknown tenant',
    })
  }
  return tenant
}

async function fetchPublishedSlugs(
  collection: string,
  tenantId: number,
): Promise<SitemapDoc[]> {
  const result = await findCollection<SitemapDoc>(collection, {
    depth: 0,
    limit: 1000,
    pagination: false,
    select: {
      slug: true,
      updatedAt: true,
    },
    where: mergeWhere(
      {
        tenant: {
          equals: tenantId,
        },
      },
      {
        _status: {
          equals: 'published',
        },
      },
    ),
  })

  return result.docs
}

function toAbsoluteUrl(origin: string, path: string): string {
  if (path === '/') return `${origin}/`
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

export async function buildTenantSitemapEntries(
  tenant: Tenant,
  origin: string,
): Promise<SitemapEntry[]> {
  const dateFallback = new Date().toISOString()
  const entries: SitemapEntry[] = [
    { loc: toAbsoluteUrl(origin, '/'), lastmod: dateFallback },
    { loc: toAbsoluteUrl(origin, '/posts'), lastmod: dateFallback },
  ]

  const [pages, posts] = await Promise.all([
    fetchPublishedSlugs('pages', tenant.id),
    fetchPublishedSlugs('posts', tenant.id),
  ])

  for (const page of pages) {
    if (!page.slug) continue
    entries.push({
      loc: toAbsoluteUrl(origin, `/${page.slug}`),
      lastmod: page.updatedAt || dateFallback,
    })
  }

  for (const post of posts) {
    if (!post.slug) continue
    entries.push({
      loc: toAbsoluteUrl(origin, `/posts/${post.slug}`),
      lastmod: post.updatedAt || dateFallback,
    })
  }

  if (tenantHasCollection(tenant, 'events')) {
    entries.push({ loc: toAbsoluteUrl(origin, '/events'), lastmod: dateFallback })

    const events = await fetchPublishedSlugs('events', tenant.id)
    for (const eventDoc of events) {
      if (!eventDoc.slug) continue
      entries.push({
        loc: toAbsoluteUrl(origin, `/events/${eventDoc.slug}`),
        lastmod: eventDoc.updatedAt || dateFallback,
      })
    }
  }

  return entries
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function renderSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod
        ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`
        : ''
      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

export function renderRobotsTxt(origin: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`
}
