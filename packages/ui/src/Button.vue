<script setup lang="ts">
import { cn } from '@liskof-digital/utils'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: 'default',
    size: 'md',
    type: 'button',
    disabled: false,
  },
)

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent disabled:pointer-events-none disabled:opacity-50'

  const variants: Record<string, string> = {
    default: 'bg-brand-ink text-white hover:bg-brand-accent',
    primary: 'bg-brand-ink text-white hover:bg-brand-accent',
    secondary: 'border border-brand-ink/20 bg-transparent text-brand-ink hover:border-brand-accent hover:text-brand-accent',
    outline: 'border border-brand-ink/20 bg-transparent text-brand-ink hover:border-brand-accent hover:text-brand-accent',
    ghost: 'bg-transparent text-brand-ink hover:bg-brand-ink/5',
    link: 'min-h-0 bg-transparent px-0 text-brand-accent underline-offset-4 hover:underline',
  }

  const sizes: Record<string, string> = {
    sm: 'min-h-9 rounded-md px-3 text-sm',
    md: 'min-h-11 rounded-md px-5 text-sm',
    lg: 'min-h-12 rounded-lg px-8 text-base',
  }

  return cn(
    base,
    variants[props.variant],
    props.variant === 'link' ? null : sizes[props.size],
  )
})
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>
