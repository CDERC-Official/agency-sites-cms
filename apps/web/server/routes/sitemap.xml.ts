import {
  buildTenantSitemapEntries,
  getSiteOrigin,
  renderSitemapXml,
  requireTenant,
} from '../utils/seo'

export default defineEventHandler(async (event) => {
  const tenant = requireTenant(event)
  const origin = getSiteOrigin(event)
  const entries = await buildTenantSitemapEntries(tenant, origin)

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return renderSitemapXml(entries)
})
