<script setup lang="ts">
import { cn } from '@liskof-digital/utils'

withDefaults(
  defineProps<{
    modelValue?: string
    id?: string
    name?: string
    placeholder?: string
    rows?: number
    required?: boolean
    disabled?: boolean
    class?: string
  }>(),
  {
    modelValue: '',
    rows: 4,
    required: false,
    disabled: false,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <textarea
    :id="id"
    :name="name"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :required="required"
    :disabled="disabled"
    :class="
      cn(
        'flex min-h-28 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/20 disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )
    "
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
