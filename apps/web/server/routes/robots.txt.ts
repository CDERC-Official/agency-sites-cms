import { getSiteOrigin, renderRobotsTxt, requireTenant } from '../utils/seo'

export default defineEventHandler((event) => {
  requireTenant(event)
  const origin = getSiteOrigin(event)

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return renderRobotsTxt(origin)
})
