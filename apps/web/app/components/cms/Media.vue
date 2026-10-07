<script setup lang="ts">
import type { CmsMedia } from '@liskof-digital/types'
import { cn, getMediaUrl } from '@liskof-digital/utils'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    resource?: number | CmsMedia | null
    class?: string
    imgClass?: string
    size?: string
    fill?: boolean
    priority?: boolean
  }>(),
  {
    resource: null,
    size: undefined,
    fill: false,
    priority: false,
  },
)

const config = useRuntimeConfig()
const media = computed(() =>
  props.resource && typeof props.resource === 'object' ? props.resource : null,
)
const src = computed(() =>
  getMediaUrl(media.value, String(config.public.payloadUrl || ''), props.size),
)
const isVideo = computed(() => Boolean(media.value?.mimeType?.includes('video')))
</script>

<template>
  <div v-if="media && src" :class="cn(fill && 'absolute inset-0', $props.class)">
    <video
      v-if="isVideo"
      :src="src"
      class="h-full w-full object-cover"
      autoplay
      muted
      loop
      playsinline
    />
    <img
      v-else
      :src="src"
      :alt="media.alt || ''"
      :class="cn(fill ? 'h-full w-full object-cover' : 'h-auto w-full', imgClass)"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : undefined"
    >
  </div>
</template>
