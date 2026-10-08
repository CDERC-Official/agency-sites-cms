<script setup lang="ts">
import { cn } from '@liskof-digital/utils'

defineProps<{
  class?: string
  as?: string
}>()
</script>

<template>
  <component :is="as || 'div'" :class="cn('container', $props.class)">
    <slot />
  </component>
</template>
