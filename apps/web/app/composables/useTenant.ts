import type { Tenant } from '@liskof-digital/types'

export function useTenant() {
  const tenant = useState<Tenant | null>('tenant', () => null)

  if (import.meta.server && !tenant.value) {
    const event = useRequestEvent()
    const fromContext = event?.context?.tenant as Tenant | undefined
    if (fromContext) {
      tenant.value = fromContext
    }
  }

  const tenantId = computed(() => tenant.value?.id ?? null)

  return {
    tenant,
    tenantId,
  }
}
