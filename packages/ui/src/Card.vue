<script setup lang="ts">
import { cn } from '@liskof-digital/utils'

defineProps<{
  class?: string
}>()
</script>

<template>
  <article
    :class="
      cn(
        'overflow-hidden rounded-lg border border-border bg-card text-card-foreground',
        $props.class,
      )
    "
  >
    <slot />
  </article>
</template>
