<script setup lang="ts">
import type { LexicalRichText } from '@liskof-digital/types'

defineProps<{
  richText?: LexicalRichText | null
}>()
</script>

<template>
  <section class="py-16">
    <UContainer>
      <div class="max-w-3xl">
        <CmsRichText v-if="richText" :data="richText" />
      </div>
    </UContainer>
  </section>
</template>
