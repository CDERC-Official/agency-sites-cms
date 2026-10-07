<script setup lang="ts">
import type { LexicalNode } from '@liskof-digital/types'
import { getCmsHref, getMediaUrl } from '@liskof-digital/utils'
import { computed } from 'vue'

const props = defineProps<{
  nodes?: LexicalNode[] | null
}>()

const IS_BOLD = 1
const IS_ITALIC = 1 << 1
const IS_STRIKETHROUGH = 1 << 2
const IS_UNDERLINE = 1 << 3
const IS_CODE = 1 << 4
const IS_SUBSCRIPT = 1 << 5
const IS_SUPERSCRIPT = 1 << 6

const config = useRuntimeConfig()
const mediaBase = computed(() => String(config.public.payloadUrl || ''))

function textClasses(format: number): string {
  return [
    format & IS_BOLD ? 'font-semibold' : '',
    format & IS_ITALIC ? 'italic' : '',
    format & IS_UNDERLINE ? 'underline' : '',
    format & IS_STRIKETHROUGH ? 'line-through' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function linkHref(node: LexicalNode): string | null {
  const fields = (node.fields || {}) as Record<string, unknown>
  const doc = fields.doc as
    | { relationTo?: 'pages' | 'posts'; value?: { slug?: string } | number }
    | undefined

  if (doc && typeof doc.value === 'object' && doc.value?.slug) {
    return doc.relationTo === 'posts' ? `/posts/${doc.value.slug}` : `/${doc.value.slug}`
  }

  return (
    getCmsHref({
      type: 'custom',
      url: (fields.url as string) || node.url || null,
    }) || null
  )
}

function uploadSrc(node: LexicalNode): string | null {
  return getMediaUrl(node.value as never, mediaBase.value)
}

function uploadAlt(node: LexicalNode): string {
  const value = node.value as { alt?: string } | null
  return value && typeof value === 'object' ? value.alt || '' : ''
}

function isVideo(node: LexicalNode): boolean {
  const value = node.value as { mimeType?: string } | null
  return Boolean(value && typeof value === 'object' && value.mimeType?.includes('video'))
}
</script>

<template>
  <template v-for="(node, index) in nodes || []" :key="index">
    <template v-if="node.type === 'text'">
      <code v-if="typeof node.format === 'number' && node.format & IS_CODE">{{ node.text }}</code>
      <sub v-else-if="typeof node.format === 'number' && node.format & IS_SUBSCRIPT">{{ node.text }}</sub>
      <sup v-else-if="typeof node.format === 'number' && node.format & IS_SUPERSCRIPT">{{ node.text }}</sup>
      <span v-else :class="textClasses(typeof node.format === 'number' ? node.format : 0)">{{ node.text }}</span>
    </template>

    <br v-else-if="node.type === 'linebreak'">

    <p v-else-if="node.type === 'paragraph'">
      <CmsLexicalNodes :nodes="node.children" />
    </p>

    <component :is="(node.tag as string) || 'h2'" v-else-if="node.type === 'heading'">
      <CmsLexicalNodes :nodes="node.children" />
    </component>

    <ol v-else-if="node.type === 'list' && node.listType === 'number'">
      <CmsLexicalNodes :nodes="node.children" />
    </ol>
    <ul v-else-if="node.type === 'list'">
      <CmsLexicalNodes :nodes="node.children" />
    </ul>

    <li v-else-if="node.type === 'listitem'">
      <CmsLexicalNodes :nodes="node.children" />
    </li>

    <blockquote v-else-if="node.type === 'quote'">
      <CmsLexicalNodes :nodes="node.children" />
    </blockquote>

    <NuxtLink
      v-else-if="(node.type === 'link' || node.type === 'autolink') && linkHref(node)"
      :to="linkHref(node)!"
      class="text-brand-accent underline underline-offset-4"
      :target="(node.fields as { newTab?: boolean } | undefined)?.newTab ? '_blank' : undefined"
      :rel="(node.fields as { newTab?: boolean } | undefined)?.newTab ? 'noopener noreferrer' : undefined"
    >
      <CmsLexicalNodes :nodes="node.children" />
    </NuxtLink>

    <hr v-else-if="node.type === 'horizontalrule'" class="my-8 border-border">

    <video
      v-else-if="node.type === 'upload' && isVideo(node) && uploadSrc(node)"
      :src="uploadSrc(node)!"
      controls
      class="my-4 w-full rounded-lg"
    />
    <img
      v-else-if="node.type === 'upload' && uploadSrc(node)"
      :src="uploadSrc(node)!"
      :alt="uploadAlt(node)"
      class="my-4 h-auto w-full rounded-lg"
      loading="lazy"
    >

    <div v-else-if="node.children?.length">
      <CmsLexicalNodes :nodes="node.children" />
    </div>
  </template>
</template>
