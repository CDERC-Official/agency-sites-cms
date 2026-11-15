import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { superAdminOrTenantAdminAccess } from '@/access/superAdminOrTenantAdmin'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
    read: anyone,
    update: superAdminOrTenantAdminAccess,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      disableUnique: true,
      position: undefined,
    }),
  ],
}
