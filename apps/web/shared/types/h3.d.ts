import type { Tenant } from '@liskof-digital/types'

declare module 'h3' {
  interface H3EventContext {
    tenant?: Tenant
  }
}

export {}
