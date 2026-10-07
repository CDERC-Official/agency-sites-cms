<script setup lang="ts">
import { cn } from '@liskof-digital/utils'

withDefaults(
  defineProps<{
    modelValue?: string
    id?: string
    name?: string
    required?: boolean
    disabled?: boolean
    options?: { label: string; value: string }[]
    placeholder?: string
    class?: string
  }>(),
  {
    modelValue: '',
    required: false,
    disabled: false,
    options: () => [],
    placeholder: 'Select…',
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <select
    :id="id"
    :name="name"
    :value="modelValue"
    :required="required"
    :disabled="disabled"
    :class="
      cn(
        'flex min-h-11 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/20 disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )
    "
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>
