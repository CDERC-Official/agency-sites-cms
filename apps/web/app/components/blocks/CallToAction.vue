<script setup lang="ts">
import type { CmsLink, LexicalRichText } from '@liskof-digital/types'

defineProps<{
  richText?: LexicalRichText | null
  links?: { link: CmsLink; id?: string | null }[] | null
}>()
</script>

<template>
  <UContainer>
    <UCard
      class="md:p-2"
      :ui="{ body: 'flex flex-col items-start justify-between gap-8 md:flex-row md:items-center' }"
    >
      <div class="max-w-2xl">
        <CmsRichText v-if="richText" class="mb-0" :data="richText" />
      </div>
      <div class="flex flex-col gap-4 sm:flex-row">
        <CmsLink
          v-for="(item, index) in links || []"
          :key="item.id || index"
          :link="item.link"
          size="lg"
        />
      </div>
    </UCard>
  </UContainer>
</template>
