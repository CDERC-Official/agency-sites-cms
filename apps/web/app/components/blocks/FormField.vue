<script setup lang="ts">
import type { CmsFormField } from '@liskof-digital/types'
import { computed } from 'vue'
import { countryOptions } from '~/utils/formOptions'

const props = defineProps<{
  field: CmsFormField
  modelValue: Record<string, string | number | boolean>
  errors: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string | number | boolean>]
}>()

const widthStyle = computed(() => {
  if (!('width' in props.field) || !props.field.width) return undefined
  return { maxWidth: `${props.field.width}%` }
})

function setValue(name: string, value: string | number | boolean) {
  emit('update:modelValue', {
    ...props.modelValue,
    [name]: value,
  })
}

const selectItems = computed(() => {
  if (props.field.blockType === 'select') return props.field.options || []
  if (props.field.blockType === 'country') return countryOptions
  if (props.field.blockType === 'state') {
    return [
      { label: 'Alabama', value: 'AL' },
      { label: 'Alaska', value: 'AK' },
      { label: 'Arizona', value: 'AZ' },
      { label: 'California', value: 'CA' },
      { label: 'Colorado', value: 'CO' },
      { label: 'Florida', value: 'FL' },
      { label: 'Georgia', value: 'GA' },
      { label: 'Illinois', value: 'IL' },
      { label: 'New York', value: 'NY' },
      { label: 'Texas', value: 'TX' },
      { label: 'Washington', value: 'WA' },
    ]
  }
  return []
})

const selectPlaceholder = computed(() => {
  if (!('name' in props.field)) return 'Select…'
  if (props.field.blockType === 'select') {
    return props.field.placeholder || props.field.label || 'Select…'
  }
  return props.field.label || 'Select…'
})
</script>

<template>
  <div :style="widthStyle">
    <CmsRichText
      v-if="field.blockType === 'message' && field.message"
      :data="field.message"
    />

    <template v-else-if="'name' in field">
      <UFormField
        v-if="field.blockType === 'checkbox'"
        :name="field.name"
        :error="errors[field.name]"
      >
        <UCheckbox
          :model-value="Boolean(modelValue[field.name])"
          :name="field.name"
          :label="field.label || undefined"
          :required="Boolean(field.required)"
          @update:model-value="setValue(field.name, Boolean($event))"
        />
      </UFormField>

      <UFormField
        v-else
        :name="field.name"
        :label="field.label || undefined"
        :required="Boolean(field.required)"
        :error="errors[field.name]"
      >
        <UTextarea
          v-if="field.blockType === 'textarea'"
          :id="field.name"
          class="w-full"
          :model-value="String(modelValue[field.name] ?? '')"
          :name="field.name"
          :required="Boolean(field.required)"
          @update:model-value="setValue(field.name, $event)"
        />

        <USelect
          v-else-if="field.blockType === 'select' || field.blockType === 'country' || field.blockType === 'state'"
          :id="field.name"
          class="w-full"
          :model-value="String(modelValue[field.name] ?? '') || undefined"
          :name="field.name"
          :items="selectItems"
          :placeholder="selectPlaceholder"
          :required="Boolean(field.required)"
          @update:model-value="setValue(field.name, String($event ?? ''))"
        />

        <UInput
          v-else
          :id="field.name"
          class="w-full"
          :model-value="String(modelValue[field.name] ?? '')"
          :name="field.name"
          :required="Boolean(field.required)"
          :type="field.blockType === 'email' ? 'email' : field.blockType === 'number' ? 'number' : 'text'"
          @update:model-value="setValue(field.name, field.blockType === 'number' ? Number($event) : String($event ?? ''))"
        />
      </UFormField>
    </template>
  </div>
</template>
