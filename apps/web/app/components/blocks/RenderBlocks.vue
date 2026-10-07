<script setup lang="ts">
import type { PageLayoutBlock } from '@liskof-digital/types'
import BlocksArchive from './Archive.vue'
import BlocksCallToAction from './CallToAction.vue'
import BlocksContent from './Content.vue'
import BlocksForm from './Form.vue'
import BlocksMedia from './Media.vue'

defineProps<{
  blocks?: PageLayoutBlock[] | null
}>()

const blockComponents = {
  archive: BlocksArchive,
  content: BlocksContent,
  cta: BlocksCallToAction,
  formBlock: BlocksForm,
  mediaBlock: BlocksMedia,
} as const

function resolveBlock(blockType: string) {
  return blockComponents[blockType as keyof typeof blockComponents] || null
}
</script>

<template>
  <div v-if="blocks?.length" class="flex flex-col gap-16 py-8">
    <component
      :is="resolveBlock(block.blockType)"
      v-for="(block, index) in blocks"
      :key="block.id || index"
      v-bind="block"
    />
  </div>
</template>
