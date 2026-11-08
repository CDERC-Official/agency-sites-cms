import React from 'react'

type WelcomeHeaderProps = {
  greeting?: string
  subtitle?: string
  createHref?: string
}

export function WelcomeHeader({
  greeting = 'Good morning!',
  subtitle = 'Manage your website content in one place.',
  createHref = '/admin/collections/pages',
}: WelcomeHeaderProps) {
  return (
    <header className="agency-dashboard__header">
      <div>
        <p className="agency-eyebrow">WEBSITE WORKSPACE</p>
        <h1>{greeting}</h1>
        <p>{subtitle}</p>
      </div>

      <a className="agency-button" href={createHref}>
        + Create content
      </a>
    </header>
  )
}
