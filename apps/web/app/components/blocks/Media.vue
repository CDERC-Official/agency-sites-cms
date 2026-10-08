<script setup lang="ts">
import type { CmsMedia } from '@liskof-digital/types'
import { computed } from 'vue'

const props = defineProps<{
  media: number | CmsMedia
}>()

const mediaResource = computed(() =>
  typeof props.media === 'object' ? props.media : null,
)
const caption = computed(() => mediaResource.value?.caption || null)
</script>

<template>
  <UContainer v-if="mediaResource">
    <CmsMedia
      img-class="rounded-lg border border-default"
      :resource="mediaResource"
    />
    <CmsRichText
      v-if="caption"
      class="mt-6 text-sm text-muted"
      :data="caption"
    />
  </UContainer>
</template>
