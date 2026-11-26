import type { CmsMeta } from '@liskof-digital/types'
import { getMediaUrl } from '@liskof-digital/utils'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

type CmsSeoInput = {
  meta?: CmsMeta | null
  title: string
  /** Open Graph type. Defaults to `website`. */
  ogType?: 'website' | 'article'
}

export function useCmsSeoMeta(input: MaybeRefOrGetter<CmsSeoInput | null | undefined>) {
  const config = useRuntimeConfig()
  const requestURL = useRequestURL()

  const resolved = computed(() => {
    const value = toValue(input)
    if (!value) return null

    const title = value.meta?.title || value.title
    const description = value.meta?.description || undefined
    const image = getMediaUrl(
      value.meta?.image,
      String(config.public.payloadUrl || ''),
      'og',
    )

    return {
      title,
      description,
      image,
      url: requestURL.href,
      ogType: value.ogType || 'website',
    }
  })

  useSeoMeta({
    title: () => resolved.value?.title,
    description: () => resolved.value?.description,
    ogTitle: () => resolved.value?.title,
    ogDescription: () => resolved.value?.description,
    ogImage: () => resolved.value?.image || undefined,
    ogUrl: () => resolved.value?.url,
    ogType: () => resolved.value?.ogType,
    twitterCard: () =>
      resolved.value?.image ? 'summary_large_image' : 'summary',
    twitterTitle: () => resolved.value?.title,
    twitterDescription: () => resolved.value?.description,
    twitterImage: () => resolved.value?.image || undefined,
  })

  return { resolved }
}
