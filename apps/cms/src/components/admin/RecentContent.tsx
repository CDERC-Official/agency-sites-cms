import React from 'react'

export type RecentContentItem = {
  id: string
  title: string
  type: string
  status: 'Published' | 'Draft'
  href?: string
  updatedAt?: string
}

type RecentContentProps = {
  items: RecentContentItem[]
  viewAllHref?: string
}

export function RecentContent({
  items,
  viewAllHref = '/admin/collections/pages',
}: RecentContentProps) {
  return (
    <section className="agency-card">
      <div className="agency-section-heading">
        <div>
          <h2>Recent content</h2>
          <p>Your latest website updates</p>
        </div>
        <a href={viewAllHref}>View pages →</a>
      </div>

      {items.length === 0 ? (
        <p className="agency-activity__empty">No content yet. Create a page to get started.</p>
      ) : (
        <div className="agency-activity">
          {items.map((item) => (
            <div className="agency-activity__row" key={item.id}>
              <div>
                {item.href ? (
                  <a href={item.href}>
                    <strong>{item.title}</strong>
                  </a>
                ) : (
                  <strong>{item.title}</strong>
                )}
                <p>{item.type}</p>
              </div>
              <span
                className={`agency-status agency-status--${item.status.toLowerCase()}`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
