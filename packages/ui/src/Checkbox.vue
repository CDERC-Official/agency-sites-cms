<script setup lang="ts">
import { cn } from '@liskof-digital/utils'

withDefaults(
  defineProps<{
    modelValue?: boolean
    id?: string
    name?: string
    required?: boolean
    disabled?: boolean
    class?: string
  }>(),
  {
    modelValue: false,
    required: false,
    disabled: false,
  },
)

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <input
    :id="id"
    :name="name"
    type="checkbox"
    :checked="modelValue"
    :required="required"
    :disabled="disabled"
    :class="
      cn(
        'size-4 rounded border border-border text-brand-accent accent-brand-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )
    "
    @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
  >
</template>
