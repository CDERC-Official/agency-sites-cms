<script setup lang="ts">
import { tenantHasCollection } from '@liskof-digital/types'
import { expandEventOccurrences } from '@liskof-digital/utils'

const { tenant } = useTenant()
const { getEvents } = usePayload()

if (!tenantHasCollection(tenant.value, 'events')) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const { data, error, pending } = await useAsyncData('events-list', () => getEvents())

const occurrences = computed(() => {
  const docs = data.value?.docs ?? []
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  const to = new Date(from)
  to.setDate(to.getDate() + 90)
  return expandEventOccurrences(docs, { from, to })
})

function formatOccurrenceDate(date: Date, allDay?: boolean | null) {
  if (allDay) {
    return date.toLocaleDateString()
  }
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

useSeoMeta({
  title: 'Events',
  description: 'Upcoming events.',
})
</script>

<template>
  <UContainer class="flex min-h-screen flex-col gap-10 py-20">
    <div class="flex flex-col gap-4">
      <UButton to="/" variant="link" color="primary" size="sm">
        ← Home
      </UButton>
      <h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Events</h1>
      <p class="max-w-2xl text-lg text-muted">Upcoming events for the next 90 days.</p>
    </div>

    <p v-if="pending" class="text-muted">Loading events…</p>
    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      title="Could not load events"
      description="Could not load events from Payload CMS."
    />
    <p v-else-if="!occurrences.length" class="text-muted">No upcoming events.</p>
    <ul v-else class="flex flex-col gap-6">
      <li
        v-for="(occurrence, index) in occurrences"
        :key="`${occurrence.event.id}-${occurrence.occurrenceStart.toISOString()}-${index}`"
        class="flex flex-col gap-1"
      >
        <UButton
          :to="`/events/${occurrence.event.slug}`"
          variant="link"
          color="primary"
          class="justify-start text-xl font-medium"
        >
          {{ occurrence.event.title }}
        </UButton>
        <p class="text-sm text-muted">
          {{ formatOccurrenceDate(occurrence.occurrenceStart, occurrence.event.allDay) }}
          <span v-if="occurrence.event.isRecurring"> · Recurring</span>
        </p>
        <p v-if="occurrence.event.location" class="text-sm text-muted">
          {{ occurrence.event.location }}
        </p>
        <p v-if="occurrence.event.meta?.description" class="text-muted">
          {{ occurrence.event.meta.description }}
        </p>
      </li>
    </ul>
  </UContainer>
</template>
