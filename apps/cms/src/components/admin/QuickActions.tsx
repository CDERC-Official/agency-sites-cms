import React from 'react'

export type QuickAction = {
  label: string
  href: string
}

type QuickActionsProps = {
  actions: QuickAction[]
  previewHref?: string
}

export function QuickActions({
  actions,
  previewHref = '/',
}: QuickActionsProps) {
  return (
    <section className="agency-card">
      <h2>Quick actions</h2>
      <p>Common tasks for your website</p>

      <nav className="agency-actions" aria-label="Quick actions">
        {actions.map((action) => (
          <a className="agency-action" href={action.href} key={action.label}>
            <span>{action.label}</span>
            <span aria-hidden="true">→</span>
          </a>
        ))}
      </nav>

      <div className="agency-preview">
        <div>
          <p className="agency-eyebrow">YOUR WEBSITE</p>
          <h3>Your website, your message.</h3>
          <p>Keep your content current and your visitors informed.</p>
        </div>
        <a
          href={previewHref}
          target="_blank"
          rel="noreferrer"
          className="agency-preview__link"
        >
          Preview website ↗
        </a>
      </div>
    </section>
  )
}
