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

export const event1: (args: EventArgs) => RequiredDataFromCollectionSlug<'events'> = ({
  heroImage,
}) => {
  const startDate = daysFromNow(7, 18)
  const endDate = daysFromNow(7, 20)

  return {
    slug: 'community-open-house',
    _status: 'published',
    title: 'Community Open House',
    heroImage: heroImage.id,
    location: 'Main Hall',
    startDate,
    endDate,
    allDay: false,
    isRecurring: false,
    publishedAt: new Date().toISOString(),
    meta: {
      title: 'Community Open House',
      description: 'Meet the team, tour the space, and learn what is coming next.',
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
                text: 'Join us for an evening open house. Tour the space, meet the team, and hear about upcoming programs.',
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
