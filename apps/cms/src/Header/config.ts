import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { superAdminOrTenantAdminAccess } from '@/access/superAdminOrTenantAdmin'
import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: CollectionConfig = {
  slug: 'header',
  labels: {
    singular: 'Header',
    plural: 'Header',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
    read: anyone,
    update: superAdminOrTenantAdminAccess,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
