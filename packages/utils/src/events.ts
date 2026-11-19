import type { CmsEvent, CmsEventOccurrence } from '@liskof-digital/types'

export type ExpandEventOccurrencesOptions = {
  from: Date
  to: Date
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function addInterval(
  date: Date,
  frequency: NonNullable<CmsEvent['frequency']>,
  interval: number,
): Date {
  const next = new Date(date.getTime())

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval)
      break
    case 'weekly':
      next.setDate(next.getDate() + interval * 7)
      break
    case 'monthly': {
      const day = date.getDate()
      next.setMonth(next.getMonth() + interval)
      const maxDay = daysInMonth(next.getFullYear(), next.getMonth())
      next.setDate(Math.min(day, maxDay))
      break
    }
    case 'yearly': {
      const month = date.getMonth()
      const day = date.getDate()
      next.setFullYear(next.getFullYear() + interval)
      next.setMonth(month)
      const maxDay = daysInMonth(next.getFullYear(), month)
      next.setDate(Math.min(day, maxDay))
      break
    }
  }

  return next
}

function occurrenceEndFor(event: CmsEvent, occurrenceStart: Date): Date | null {
  if (!event.endDate) return null

  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  const durationMs = end.getTime() - start.getTime()

  if (Number.isNaN(durationMs) || durationMs < 0) return null

  return new Date(occurrenceStart.getTime() + durationMs)
}

function isWithinRange(date: Date, from: Date, to: Date): boolean {
  return date.getTime() >= from.getTime() && date.getTime() <= to.getTime()
}

/**
 * Expand parent events (including simple recurrence rules) into occurrences
 * that fall within `[from, to]`.
 */
export function expandEventOccurrences(
  events: CmsEvent[],
  { from, to }: ExpandEventOccurrencesOptions,
): CmsEventOccurrence[] {
  const occurrences: CmsEventOccurrence[] = []

  for (const event of events) {
    if (!event.startDate) continue

    const start = new Date(event.startDate)
    if (Number.isNaN(start.getTime())) continue

    if (!event.isRecurring || !event.frequency) {
      if (isWithinRange(start, from, to)) {
        occurrences.push({
          event,
          occurrenceStart: start,
          occurrenceEnd: occurrenceEndFor(event, start),
        })
      }
      continue
    }

    const interval = Math.max(1, event.interval ?? 1)
    const until =
      event.ends === 'onDate' && event.until ? new Date(event.until) : null
    const maxCount =
      event.ends === 'afterCount' && event.count ? event.count : null

    let cursor = start
    let occurrenceIndex = 0

    while (cursor.getTime() <= to.getTime()) {
      if (until && !Number.isNaN(until.getTime()) && cursor.getTime() > until.getTime()) {
        break
      }
      if (maxCount !== null && occurrenceIndex >= maxCount) {
        break
      }

      if (isWithinRange(cursor, from, to)) {
        occurrences.push({
          event,
          occurrenceStart: new Date(cursor.getTime()),
          occurrenceEnd: occurrenceEndFor(event, cursor),
        })
      }

      occurrenceIndex += 1
      cursor = addInterval(cursor, event.frequency, interval)

      if (occurrenceIndex > 10_000) break
    }
  }

  return occurrences.sort(
    (a, b) => a.occurrenceStart.getTime() - b.occurrenceStart.getTime(),
  )
}
