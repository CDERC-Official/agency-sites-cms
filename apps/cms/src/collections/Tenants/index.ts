import type { Access, CollectionConfig } from 'payload'

import { isSuperAdminAccess } from '@/access/isSuperAdmin'
import {
  CMS_LOCALE_OPTIONS,
  DEFAULT_CMS_LOCALE,
  isCmsLocale,
  type CmsLocale,
} from '@/utilities/cmsLocales'
import { OPTIONAL_TENANT_COLLECTIONS } from '@/utilities/optionalTenantCollections'

import { updateAndDeleteAccess } from './access/updateAndDelete'

const readAccess: Access = ({ req }) => {
  if (req.user) return true

  return {
    allowPublicRead: {
      equals: true,
    },
  }
}

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: isSuperAdminAccess,
    delete: updateAndDeleteAccess,
    read: readAccess,
    update: updateAndDeleteAccess,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'domain',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Used for domain-based tenant handling',
      },
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Used for url paths, example: /tenant-slug/page-slug',
      },
      index: true,
      required: true,
    },
    {
      name: 'allowPublicRead',
      type: 'checkbox',
      admin: {
        description:
          'If checked, logging in is not required to read. Useful for building public pages.',
        position: 'sidebar',
      },
      defaultValue: false,
      index: true,
    },
    {
      name: 'enabledCollections',
      type: 'select',
      hasMany: true,
      options: [...OPTIONAL_TENANT_COLLECTIONS],
      defaultValue: [],
      admin: {
        description:
          'Optional collections available for this tenant. None are enabled by default.',
        position: 'sidebar',
      },
    },
    {
      // Must not be named `locales` — that creates `tenants_locales`, which collides with
      // Payload/Drizzle's localization table suffix (`_locales`) and crashes queries.
      name: 'enabledLocales',
      type: 'select',
      hasMany: true,
      options: [...CMS_LOCALE_OPTIONS],
      defaultValue: [DEFAULT_CMS_LOCALE],
      required: true,
      admin: {
        description: 'Locales available for this tenant. Must be a subset of the platform catalog.',
        position: 'sidebar',
      },
    },
    {
      name: 'defaultLocale',
      type: 'select',
      options: [...CMS_LOCALE_OPTIONS],
      defaultValue: DEFAULT_CMS_LOCALE,
      required: true,
      admin: {
        description: 'Fallback locale for this tenant. Must be one of the enabled locales.',
        position: 'sidebar',
      },
      validate: (
        value: unknown,
        { data }: { data: { enabledLocales?: CmsLocale[] | null } },
      ) => {
        if (!isCmsLocale(value)) {
          return 'Default locale is required'
        }

        const enabled = data?.enabledLocales
        if (Array.isArray(enabled) && enabled.length > 0 && !enabled.includes(value)) {
          return 'Default locale must be one of the enabled locales'
        }

        return true
      },
    },
    {
      name: 'showLanguageSwitcher',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Show the language switcher on the frontend. Only appears when two or more locales are enabled.',
        position: 'sidebar',
      },
    },
  ],
}
