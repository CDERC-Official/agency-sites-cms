<script setup lang="ts">
import type { CmsForm, CmsFormField, LexicalRichText } from '@liskof-digital/types'
import { computed, reactive, ref } from 'vue'

const props = defineProps<{
  form: number | CmsForm
  enableIntro?: boolean | null
  introContent?: LexicalRichText | null
}>()

const config = useRuntimeConfig()
const formDoc = computed(() => (typeof props.form === 'object' ? props.form : null))

const values = reactive<Record<string, string | number | boolean>>({})
const errors = reactive<Record<string, string>>({})
const isLoading = ref(false)
const hasSubmitted = ref(false)
const submitError = ref<string | null>(null)

function initDefaults() {
  for (const field of formDoc.value?.fields || []) {
    if (field.blockType === 'message') continue
    if ('name' in field) {
      if (field.blockType === 'checkbox') {
        values[field.name] = Boolean(field.defaultValue)
      } else if ('defaultValue' in field && field.defaultValue != null) {
        values[field.name] = field.defaultValue
      } else {
        values[field.name] = ''
      }
    }
  }
}

initDefaults()

function validate(): boolean {
  Object.keys(errors).forEach((key) => delete errors[key])
  let valid = true

  for (const field of formDoc.value?.fields || []) {
    if (field.blockType === 'message' || !('name' in field)) continue
    if (!field.required) continue

    const value = values[field.name]
    const empty =
      value === '' ||
      value === null ||
      value === undefined ||
      (field.blockType === 'checkbox' && value !== true)

    if (empty) {
      errors[field.name] = 'This field is required'
      valid = false
    }
  }

  return valid
}

async function onSubmit() {
  if (!formDoc.value || !validate()) return

  submitError.value = null
  isLoading.value = true

  try {
    const submissionData = Object.entries(values).map(([field, value]) => ({
      field,
      value,
    }))

    await $fetch(`${String(config.public.payloadUrl).replace(/\/+$/, '')}/api/form-submissions`, {
      method: 'POST',
      body: {
        form: formDoc.value.id,
        submissionData,
      },
    })

    hasSubmitted.value = true

    if (formDoc.value.confirmationType === 'redirect' && formDoc.value.redirect?.url) {
      await navigateTo(formDoc.value.redirect.url, { external: true })
    }
  } catch (error) {
    submitError.value =
      error && typeof error === 'object' && 'data' in error
        ? String((error as { data?: { errors?: { message?: string }[] } }).data?.errors?.[0]?.message || 'Something went wrong.')
        : 'Something went wrong.'
  } finally {
    isLoading.value = false
  }
}

function fieldKey(field: CmsFormField, index: number) {
  return ('id' in field && field.id) || ('name' in field && field.name) || index
}
</script>

<template>
  <UContainer v-if="formDoc" class="lg:max-w-3xl">
    <CmsRichText
      v-if="enableIntro && introContent && !hasSubmitted"
      class="mb-8 lg:mb-12"
      :data="introContent"
    />

    <UCard>
      <CmsRichText
        v-if="hasSubmitted && formDoc.confirmationType === 'message' && formDoc.confirmationMessage"
        :data="formDoc.confirmationMessage"
      />

      <p v-else-if="isLoading" class="text-muted">Loading, please wait…</p>

      <UAlert
        v-else-if="submitError"
        color="error"
        variant="subtle"
        title="Submission failed"
        :description="submitError"
      />

      <form v-else-if="!hasSubmitted" class="flex flex-col gap-6" @submit.prevent="onSubmit">
        <BlocksFormField
          v-for="(field, index) in formDoc.fields || []"
          :key="fieldKey(field, index)"
          v-model="values"
          :errors="errors"
          :field="field"
        />

        <div>
          <UButton type="submit" :loading="isLoading">
            {{ formDoc.submitButtonLabel || 'Submit' }}
          </UButton>
        </div>
      </form>
    </UCard>
  </UContainer>
</template>
