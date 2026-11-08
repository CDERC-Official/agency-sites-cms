import React from 'react'

export type OverviewStat = {
  label: string
  value: string
  detail: string
}

type OverviewStatsProps = {
  items: OverviewStat[]
}

export function OverviewStats({ items }: OverviewStatsProps) {
  return (
    <section className="agency-dashboard__stats" aria-label="Website overview">
      {items.map((item) => (
        <article className="agency-card" key={item.label}>
          <p className="agency-card__label">{item.label}</p>
          <p className="agency-card__value">{item.value}</p>
          <p className="agency-card__detail">{item.detail}</p>
        </article>
      ))}
    </section>
  )
}
