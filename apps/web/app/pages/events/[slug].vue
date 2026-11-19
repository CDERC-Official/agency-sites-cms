<script setup lang="ts">
import { tenantHasCollection } from '@liskof-digital/types'
import { expandEventOccurrences } from '@liskof-digital/utils'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { tenant } = useTenant()
const { getEventBySlug } = usePayload()

if (!tenantHasCollection(tenant.value, 'events')) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const { data: event } = await useAsyncData(
  () => `event-${slug.value}`,
  () => getEventBySlug(slug.value),
  { watch: [slug] },
)

if (!event.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event not found' })
}

const recurrenceSummary = computed(() => {
  const doc = event.value
  if (!doc?.isRecurring || !doc.frequency) return null

  const interval = doc.interval && doc.interval > 1 ? doc.interval : null
  const unit =
    doc.frequency === 'daily'
      ? interval
        ? 'days'
        : 'day'
      : doc.frequency === 'weekly'
        ? interval
          ? 'weeks'
          : 'week'
        : doc.frequency === 'monthly'
          ? interval
            ? 'months'
            : 'month'
          : interval
            ? 'years'
            : 'year'

  let summary = interval ? `Every ${interval} ${unit}` : `Every ${unit}`

  if (doc.ends === 'onDate' && doc.until) {
    summary += ` until ${new Date(doc.until).toLocaleDateString()}`
  } else if (doc.ends === 'afterCount' && doc.count) {
    summary += ` · ${doc.count} occurrence${doc.count === 1 ? '' : 's'}`
  }

  return summary
})

const upcomingOccurrences = computed(() => {
  if (!event.value) return []
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  const to = new Date(from)
  to.setDate(to.getDate() + 90)
  return expandEventOccurrences([event.value], { from, to }).slice(0, 5)
})

function formatDate(value: string | Date, allDay?: boolean | null) {
  const date = typeof value === 'string' ? new Date(value) : value
  if (allDay) return date.toLocaleDateString()
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

useSeoMeta({
  title: event.value.meta?.title || event.value.title,
  description: event.value.meta?.description || undefined,
})
</script>

<template>
  <UContainer v-if="event" class="flex min-h-screen flex-col gap-8 py-20">
    <div class="flex flex-col gap-4">
      <UButton to="/events" variant="link" color="primary" size="sm">
        ← Events
      </UButton>
      <h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {{ event.title }}
      </h1>
      <p class="text-sm text-muted">
        {{ formatDate(event.startDate, event.allDay) }}
        <template v-if="event.endDate">
          – {{ formatDate(event.endDate, event.allDay) }}
        </template>
      </p>
      <p v-if="recurrenceSummary" class="text-sm text-muted">{{ recurrenceSummary }}</p>
      <p v-if="event.location" class="text-sm text-muted">{{ event.location }}</p>
    </div>

    <p v-if="event.meta?.description" class="max-w-2xl text-lg leading-8 text-muted">
      {{ event.meta.description }}
    </p>

    <div v-if="upcomingOccurrences.length" class="flex flex-col gap-2">
      <h2 class="text-lg font-medium">Upcoming dates</h2>
      <ul class="flex flex-col gap-1 text-sm text-muted">
        <li
          v-for="(occurrence, index) in upcomingOccurrences"
          :key="`${occurrence.occurrenceStart.toISOString()}-${index}`"
        >
          {{ formatDate(occurrence.occurrenceStart, event.allDay) }}
        </li>
      </ul>
    </div>
  </UContainer>
</template>
