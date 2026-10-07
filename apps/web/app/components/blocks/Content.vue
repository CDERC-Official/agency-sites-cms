<script setup lang="ts">
import type { ContentBlock } from '@liskof-digital/types'
import { cn } from '@liskof-digital/utils'

defineProps<{
  columns?: ContentBlock['columns']
}>()

const spanClass: Record<string, string> = {
  oneThird: 'md:col-span-4',
  half: 'md:col-span-6',
  twoThirds: 'md:col-span-8',
  full: 'md:col-span-12',
}
</script>

<template>
  <UContainer>
    <div class="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-12">
      <div
        v-for="(column, index) in columns || []"
        :key="column.id || index"
        :class="cn('col-span-1', spanClass[column.size || 'full'] || 'md:col-span-12')"
      >
        <CmsRichText v-if="column.richText" :data="column.richText" />
        <CmsLink v-if="column.enableLink && column.link" class="mt-4 inline-flex" :link="column.link" />
      </div>
    </div>
  </UContainer>
</template>
