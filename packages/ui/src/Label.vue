<script setup lang="ts">
import { cn } from '@liskof-digital/utils'

const props = defineProps<{
  htmlFor?: string
  class?: string
}>()
</script>

<template>
  <label
    :for="props.htmlFor"
    :class="cn('mb-2 block text-sm font-medium text-brand-ink', props.class)"
  >
    <slot />
  </label>
</template>
