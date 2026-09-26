import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => [
  {
    destination: '/ie-incompatible.html',
    has: [{ type: 'header' as const, key: 'user-agent', value: '(.*Trident.*)' }],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)',
  },
]
