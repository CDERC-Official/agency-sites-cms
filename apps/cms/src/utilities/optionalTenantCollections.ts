export const OPTIONAL_TENANT_COLLECTIONS = [
  { label: 'Events', value: 'events' },
] as const

export type OptionalTenantCollectionSlug =
  (typeof OPTIONAL_TENANT_COLLECTIONS)[number]['value']

export const OPTIONAL_TENANT_COLLECTION_SLUGS = OPTIONAL_TENANT_COLLECTIONS.map(
  (collection) => collection.value,
)

export function isOptionalTenantCollection(
  slug: string,
): slug is OptionalTenantCollectionSlug {
  return (OPTIONAL_TENANT_COLLECTION_SLUGS as readonly string[]).includes(slug)
}
