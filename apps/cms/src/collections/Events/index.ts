import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { tenantCollectionEnabledAccess } from '@/access/tenantCollectionEnabled'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { ensureUniqueSlug } from './hooks/ensureUniqueSlug'
import { revalidateDelete, revalidateEvent } from './hooks/revalidateEvent'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

const eventsAccess = tenantCollectionEnabledAccess('events')

type RecurrenceSiblingData = {
  isRecurring?: boolean | null
  ends?: 'never' | 'onDate' | 'afterCount' | null
}

export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  access: {
    create: eventsAccess.create,
    delete: eventsAccess.delete,
    read: eventsAccess.read,
    update: eventsAccess.update,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    startDate: true,
    endDate: true,
    allDay: true,
    isRecurring: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'startDate', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'events',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'events',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
            },
            {
              name: 'location',
              type: 'text',
            },
          ],
        },
        {
          label: 'Schedule',
          fields: [
            {
              name: 'startDate',
              type: 'date',
              required: true,
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'endDate',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'allDay',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'isRecurring',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'frequency',
              type: 'select',
              options: [
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Yearly', value: 'yearly' },
              ],
              admin: {
                condition: (_, siblingData) => Boolean(siblingData?.isRecurring),
              },
              validate: (
                value: unknown,
                { siblingData }: { siblingData: RecurrenceSiblingData },
              ) => {
                if (siblingData?.isRecurring && !value) {
                  return 'Frequency is required for recurring events'
                }
                return true
              },
            },
            {
              name: 'interval',
              type: 'number',
              defaultValue: 1,
              min: 1,
              admin: {
                condition: (_, siblingData) => Boolean(siblingData?.isRecurring),
                description: 'Repeat every N frequency units (e.g. every 2 weeks)',
              },
            },
            {
              name: 'ends',
              type: 'select',
              defaultValue: 'never',
              options: [
                { label: 'Never', value: 'never' },
                { label: 'On date', value: 'onDate' },
                { label: 'After count', value: 'afterCount' },
              ],
              admin: {
                condition: (_, siblingData) => Boolean(siblingData?.isRecurring),
              },
            },
            {
              name: 'until',
              type: 'date',
              admin: {
                condition: (_, siblingData) =>
                  Boolean(siblingData?.isRecurring) && siblingData?.ends === 'onDate',
                date: {
                  pickerAppearance: 'dayOnly',
                },
              },
              validate: (
                value: unknown,
                { siblingData }: { siblingData: RecurrenceSiblingData },
              ) => {
                if (siblingData?.isRecurring && siblingData?.ends === 'onDate' && !value) {
                  return 'End date is required when recurrence ends on a date'
                }
                return true
              },
            },
            {
              name: 'count',
              type: 'number',
              min: 1,
              admin: {
                condition: (_, siblingData) =>
                  Boolean(siblingData?.isRecurring) && siblingData?.ends === 'afterCount',
                description: 'Number of occurrences',
              },
              validate: (
                value: unknown,
                { siblingData }: { siblingData: RecurrenceSiblingData },
              ) => {
                if (siblingData?.isRecurring && siblingData?.ends === 'afterCount' && !value) {
                  return 'Count is required when recurrence ends after a number of occurrences'
                }
                return true
              },
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    slugField({
      localized: true,
      disableUnique: true,
      overrides: (field) => {
        const slug = field.fields.find(
          (f): f is import('payload').TextField => 'name' in f && f.name === 'slug',
        )
        if (slug) {
          slug.hooks = {
            ...(slug.hooks || {}),
            beforeValidate: [ensureUniqueSlug],
          }
        }
        return field
      },
    }),
  ],
  hooks: {
    afterChange: [revalidateEvent],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
