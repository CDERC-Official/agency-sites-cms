import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

const hexColorValidate = (value: string | null | undefined) => {
  if (!value) return true
  return (
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value) ||
    'Enter a valid hex color (e.g. #215073)'
  )
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: authenticated,
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
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}
