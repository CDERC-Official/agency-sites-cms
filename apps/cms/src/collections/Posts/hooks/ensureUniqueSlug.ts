import type { FieldHook, Where } from 'payload'
import { ValidationError } from 'payload'

import { extractID } from '@/utilities/extractID'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

export const ensureUniqueSlug: FieldHook = async ({ data, originalDoc, req, value }) => {
  if (originalDoc?.slug === value) {
    return value
  }

  const constraints: Where[] = [
    {
      slug: {
        equals: value,
      },
    },
  ]

  const incomingTenantID = data?.tenant ? extractID(data.tenant) : undefined
  const currentTenantID = originalDoc?.tenant ? extractID(originalDoc.tenant) : undefined
  const tenantIDToMatch = incomingTenantID || currentTenantID

  if (tenantIDToMatch) {
    constraints.push({
      tenant: {
        equals: tenantIDToMatch,
      },
    })
  }

  if (originalDoc?.id) {
    constraints.push({
      id: {
        not_equals: originalDoc.id,
      },
    })
  }

  const findDuplicatePosts = await req.payload.find({
    collection: 'posts',
    locale: req.locale,
    where: {
      and: constraints,
    },
  })

  if (findDuplicatePosts.docs.length > 0 && req.user) {
    const tenantIDs = getUserTenantIDs(req.user)

    if (req.user.roles?.includes('super-admin') || tenantIDs.length > 1) {
      const attemptedTenantChange = await req.payload.findByID({
        id: tenantIDToMatch,
        collection: 'tenants',
      })

      throw new ValidationError({
        errors: [
          {
            message: `The "${attemptedTenantChange.name}" tenant already has a post with the slug "${value}". Slugs must be unique per tenant.`,
            path: 'slug',
          },
        ],
      })
    }

    throw new ValidationError({
      errors: [
        {
          message: `A post with the slug ${value} already exists. Slug must be unique per tenant.`,
          path: 'slug',
        },
      ],
    })
  }

  return value
}
