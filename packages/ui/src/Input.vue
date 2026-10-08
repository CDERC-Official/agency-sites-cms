<script setup lang="ts">
import { cn } from '@liskof-digital/utils'

withDefaults(
  defineProps<{
    modelValue?: string | number
    type?: string
    id?: string
    name?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    class?: string
  }>(),
  {
    modelValue: '',
    type: 'text',
    required: false,
    disabled: false,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :id="id"
    :name="name"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :class="
      cn(
        'flex min-h-11 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/20 disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )
    "
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
