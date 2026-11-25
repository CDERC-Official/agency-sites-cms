import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { superAdminOrTenantAdminAccess } from '@/access/superAdminOrTenantAdmin'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

const hexColorValidate = (value: string | null | undefined) => {
  if (!value) return true
  return (
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value) ||
    'Enter a valid hex color (e.g. #215073)'
  )
}

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: {
    singular: 'Site Settings',
    plural: 'Site Settings',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
    read: anyone,
    update: superAdminOrTenantAdminAccess,
  },
  admin: {
    useAsTitle: 'businessName',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            {
              name: 'businessName',
              type: 'text',
              required: true,
              label: 'Business name',
            },
            {
              name: 'tagline',
              type: 'text',
              label: 'Tagline',
              admin: {
                description: 'Short line shown under the business name where used.',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon',
              admin: {
                description: 'Square image recommended (e.g. 32×32 or 180×180).',
              },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'contact',
              type: 'group',
              label: 'Contact info',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  label: 'Email',
                },
                {
                  name: 'phone',
                  type: 'text',
                  label: 'Phone',
                },
                {
                  name: 'address',
                  type: 'textarea',
                  label: 'Address',
                },
                {
                  name: 'website',
                  type: 'text',
                  label: 'Website URL',
                  admin: {
                    placeholder: 'https://example.com',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Design',
          fields: [
            {
              name: 'design',
              type: 'group',
              label: 'Design tokens',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'brandColor',
                      type: 'text',
                      label: 'Brand color',
                      defaultValue: '#172033',
                      admin: {
                        description: 'Primary brand / ink color.',
                        placeholder: '#172033',
                        width: '50%',
                      },
                      validate: hexColorValidate,
                    },
                    {
                      name: 'accentColor',
                      type: 'text',
                      label: 'Accent color',
                      defaultValue: '#c2410c',
                      admin: {
                        description: 'Used for CTAs and highlights.',
                        placeholder: '#c2410c',
                        width: '50%',
                      },
                      validate: hexColorValidate,
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'headingFont',
                      type: 'text',
                      label: 'Heading font',
                      defaultValue: 'Syne',
                      admin: {
                        description: 'Display / heading font family name.',
                        placeholder: 'Syne',
                        width: '50%',
                      },
                    },
                    {
                      name: 'bodyFont',
                      type: 'text',
                      label: 'Body font',
                      defaultValue: 'Source Sans 3',
                      admin: {
                        description: 'Body / UI font family name.',
                        placeholder: 'Source Sans 3',
                        width: '50%',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Local SEO',
          description:
            'Structured data for Google LocalBusiness / local pack rich results. Rendered as JSON-LD on every page.',
          fields: [
            {
              name: 'localBusiness',
              type: 'group',
              label: 'Local business',
              fields: [
                {
                  name: 'schemaType',
                  type: 'select',
                  label: 'Business type',
                  defaultValue: 'LocalBusiness',
                  options: [
                    { label: 'Local business (generic)', value: 'LocalBusiness' },
                    { label: 'Professional service', value: 'ProfessionalService' },
                    { label: 'Store', value: 'Store' },
                    { label: 'Restaurant', value: 'Restaurant' },
                    { label: 'Medical business', value: 'MedicalBusiness' },
                    { label: 'Legal service', value: 'LegalService' },
                    {
                      label: 'Home & construction',
                      value: 'HomeAndConstructionBusiness',
                    },
                  ],
                  admin: {
                    description: 'schema.org @type used in LocalBusiness JSON-LD.',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'streetAddress',
                      type: 'text',
                      label: 'Street address',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'addressLocality',
                      type: 'text',
                      label: 'City',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'addressRegion',
                      type: 'text',
                      label: 'State / region',
                      admin: { width: '33%', placeholder: 'CA' },
                    },
                    {
                      name: 'postalCode',
                      type: 'text',
                      label: 'Postal code',
                      admin: { width: '33%' },
                    },
                    {
                      name: 'addressCountry',
                      type: 'text',
                      label: 'Country',
                      admin: {
                        width: '33%',
                        placeholder: 'US',
                        description: 'ISO 3166-1 alpha-2 preferred (e.g. US, GB).',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'latitude',
                      type: 'number',
                      label: 'Latitude',
                      admin: { width: '50%', step: 0.000001 },
                    },
                    {
                      name: 'longitude',
                      type: 'number',
                      label: 'Longitude',
                      admin: { width: '50%', step: 0.000001 },
                    },
                  ],
                },
                {
                  name: 'priceRange',
                  type: 'text',
                  label: 'Price range',
                  admin: {
                    placeholder: '$$',
                    description: 'Relative price, e.g. $, $$, $$$.',
                  },
                },
                {
                  name: 'openingHours',
                  type: 'array',
                  label: 'Opening hours',
                  labels: {
                    singular: 'Hours entry',
                    plural: 'Opening hours',
                  },
                  admin: {
                    description: 'One row per schedule (e.g. weekdays vs weekend).',
                  },
                  fields: [
                    {
                      name: 'days',
                      type: 'select',
                      label: 'Days',
                      hasMany: true,
                      required: true,
                      options: [
                        { label: 'Monday', value: 'Monday' },
                        { label: 'Tuesday', value: 'Tuesday' },
                        { label: 'Wednesday', value: 'Wednesday' },
                        { label: 'Thursday', value: 'Thursday' },
                        { label: 'Friday', value: 'Friday' },
                        { label: 'Saturday', value: 'Saturday' },
                        { label: 'Sunday', value: 'Sunday' },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'opens',
                          type: 'text',
                          label: 'Opens',
                          required: true,
                          admin: {
                            width: '50%',
                            placeholder: '09:00',
                            description: '24-hour HH:mm',
                          },
                        },
                        {
                          name: 'closes',
                          type: 'text',
                          label: 'Closes',
                          required: true,
                          admin: {
                            width: '50%',
                            placeholder: '17:00',
                            description: '24-hour HH:mm',
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'sameAs',
                  type: 'array',
                  label: 'Same as (social / profiles)',
                  labels: {
                    singular: 'Profile URL',
                    plural: 'Profile URLs',
                  },
                  admin: {
                    description:
                      'Public profile URLs (Google Business, Facebook, LinkedIn, etc.).',
                  },
                  fields: [
                    {
                      name: 'url',
                      type: 'text',
                      label: 'URL',
                      required: true,
                      admin: {
                        placeholder: 'https://',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}
