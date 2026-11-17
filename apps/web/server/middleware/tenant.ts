import { fetchTenantByDomain, normalizeHostname } from '../../shared/tenant'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (
    path.startsWith('/_nuxt') ||
    path.startsWith('/__nuxt') ||
    path.startsWith('/_ipx') ||
    path === '/favicon.ico'
  ) {
    return
  }

  const config = useRuntimeConfig(event)
  const host = getRequestHost(event, { xForwardedHost: true })
  const domain = normalizeHostname(host)
  const tenant = await fetchTenantByDomain(domain, {
    payloadUrl: config.public.payloadUrl as string,
    apiToken: config.payloadApiToken as string | undefined,
  })

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Unknown tenant',
    })
  }

  event.context.tenant = tenant
})
