<script setup lang="ts">
import type { LexicalRichText } from '@liskof-digital/types'
import { cn } from '@liskof-digital/utils'
import CmsLexicalNodes from './LexicalNodes.vue'

withDefaults(
  defineProps<{
    data?: LexicalRichText | null
    class?: string
    enableProse?: boolean
  }>(),
  {
    data: null,
    enableProse: true,
  },
)
</script>

<template>
  <div
    v-if="data?.root?.children?.length"
    :class="
      cn(
        'payload-richtext',
        enableProse &&
          'cms-prose max-w-none [&_a]:text-brand-accent [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-brand-accent/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:mb-4 [&_h1]:font-display [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:mb-4 [&_p]:leading-7 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6',
        $props.class,
      )
    "
  >
    <CmsLexicalNodes :nodes="data.root.children" />
  </div>
</template>
