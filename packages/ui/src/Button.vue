<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    type: 'button',
  },
)
</script>

<template>
  <button
    :type="type"
    class="inline-flex min-h-12 items-center justify-center rounded-full px-6 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
    :class="variant === 'primary'
      ? 'bg-brand-ink text-white hover:bg-brand-accent'
      : 'border border-brand-ink/20 bg-transparent text-brand-ink hover:border-brand-accent hover:text-brand-accent'"
  >
    <slot />
  </button>
</template>
