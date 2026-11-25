import type { CmsSiteSettings } from '@liskof-digital/types'
import { getMediaUrl } from '@liskof-digital/utils'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

type JsonPrimitive = string | number | boolean
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
type JsonObject = { [key: string]: JsonValue }

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value as object).length === 0
  ) {
    return true
  }
  return false
}

function compact(value: Record<string, unknown>): JsonObject | null {
  const result: JsonObject = {}

  for (const [key, entry] of Object.entries(value)) {
    if (isEmpty(entry)) continue
    result[key] = entry as JsonValue
  }

  return Object.keys(result).length > 0 ? result : null
}

function buildLocalBusinessJsonLd(
  settings: CmsSiteSettings,
  options: { origin: string; payloadUrl: string },
): JsonObject | null {
  if (!settings.businessName) return null

  const lb = settings.localBusiness
  const contact = settings.contact

  const hasAddress =
    Boolean(lb?.streetAddress) || Boolean(lb?.addressLocality)

  const address = hasAddress
    ? compact({
        '@type': 'PostalAddress',
        streetAddress: lb?.streetAddress,
        addressLocality: lb?.addressLocality,
        addressRegion: lb?.addressRegion,
        postalCode: lb?.postalCode,
        addressCountry: lb?.addressCountry,
      })
    : null

  const geo =
    lb?.latitude != null && lb?.longitude != null
      ? compact({
          '@type': 'GeoCoordinates',
          latitude: lb.latitude,
          longitude: lb.longitude,
        })
      : null

  const openingHoursSpecification = (lb?.openingHours || [])
    .map((entry) =>
      compact({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: entry.days?.length ? entry.days : undefined,
        opens: entry.opens,
        closes: entry.closes,
      }),
    )
    .filter((entry): entry is JsonObject => Boolean(entry))

  const sameAs = (lb?.sameAs || [])
    .map((entry) => entry.url)
    .filter((url): url is string => Boolean(url))

  const logoUrl = getMediaUrl(settings.logo, options.payloadUrl)

  return compact({
    '@context': 'https://schema.org',
    '@type': lb?.schemaType || 'LocalBusiness',
    name: settings.businessName,
    description: settings.tagline,
    url: contact?.website || options.origin,
    telephone: contact?.phone,
    email: contact?.email,
    image: logoUrl,
    logo: logoUrl,
    address,
    geo,
    openingHoursSpecification:
      openingHoursSpecification.length > 0
        ? openingHoursSpecification
        : undefined,
    priceRange: lb?.priceRange,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  })
}

export function useLocalBusinessJsonLd(
  siteSettings: MaybeRefOrGetter<CmsSiteSettings | null | undefined>,
) {
  const config = useRuntimeConfig()
  const requestURL = useRequestURL()

  const jsonLd = computed(() => {
    const settings = toValue(siteSettings)
    if (!settings) return null

    return buildLocalBusinessJsonLd(settings, {
      origin: requestURL.origin,
      payloadUrl: String(config.public.payloadUrl || ''),
    })
  })

  useHead(() => {
    if (!jsonLd.value) return {}

    return {
      script: [
        {
          type: 'application/ld+json',
          key: 'local-business-jsonld',
          innerHTML: JSON.stringify(jsonLd.value),
        },
      ],
    }
  })

  return { jsonLd }
}
