<script setup lang="ts">
import type { CmsLink } from '@liskof-digital/types'
import { getCmsHref } from '@liskof-digital/utils'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    link?: CmsLink | null
    size?: 'sm' | 'md' | 'lg'
    class?: string
  }>(),
  {
    link: null,
    size: 'md',
  },
)

const href = computed(() => getCmsHref(props.link))
const appearance = computed(() => props.link?.appearance || 'default')
const label = computed(() => props.link?.label || '')
const newTab = computed(() => Boolean(props.link?.newTab))

const variant = computed(() => {
  if (appearance.value === 'outline') return 'outline' as const
  if (appearance.value === 'default') return 'solid' as const
  return 'link' as const
})

const color = computed(() => {
  if (appearance.value === 'outline') return 'neutral' as const
  return 'primary' as const
})
</script>

<template>
  <UButton
    v-if="href"
    :to="href"
    :class="$props.class"
    :target="newTab ? '_blank' : undefined"
    :rel="newTab ? 'noopener noreferrer' : undefined"
    :external="newTab"
    :size="size"
    :variant="variant"
    :color="color"
  >
    {{ label }}
  </UButton>
</template>
