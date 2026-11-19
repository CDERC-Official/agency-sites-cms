import type { Media } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

export type EventArgs = {
  heroImage: Media
}

function daysFromNow(days: number, hours = 10): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hours, 0, 0, 0)
  return date.toISOString()
}

export const event2: (args: EventArgs) => RequiredDataFromCollectionSlug<'events'> = ({
  heroImage,
}) => {
  const startDate = daysFromNow(3, 9)
  const endDate = daysFromNow(3, 10)
  const until = daysFromNow(90, 23)

  return {
    slug: 'weekly-workshop',
    _status: 'published',
    title: 'Weekly Workshop',
    heroImage: heroImage.id,
    location: 'Studio B',
    startDate,
    endDate,
    allDay: false,
    isRecurring: true,
    frequency: 'weekly',
    interval: 1,
    ends: 'onDate',
    until,
    publishedAt: new Date().toISOString(),
    meta: {
      title: 'Weekly Workshop',
      description: 'A recurring hands-on workshop every week.',
      image: heroImage.id,
    },
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Drop into this weekly workshop for practical tips, live demos, and Q&A. No registration required.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
  }
}
