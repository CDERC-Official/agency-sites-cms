<script setup lang="ts">
import type { CmsLink, CmsMedia, LexicalRichText } from '@liskof-digital/types'

defineProps<{
  richText?: LexicalRichText | null
  links?: { link: CmsLink; id?: string | null }[] | null
  media?: number | CmsMedia | null
}>()
</script>

<template>
  <section class="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-inverted text-inverted">
    <div class="absolute inset-0">
      <CmsMedia
        v-if="media && typeof media === 'object'"
        fill
        priority
        class="h-full w-full"
        img-class="h-full w-full object-cover"
        :resource="media"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-inverted via-inverted/55 to-inverted/25" />
    </div>

    <UContainer class="relative z-10 py-24">
      <div class="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <CmsRichText
          v-if="richText"
          class="[&_*]:text-inverted [&_a]:text-inverted"
          :data="richText"
        />
        <ul v-if="links?.length" class="flex flex-wrap justify-center gap-4">
          <li v-for="(item, index) in links" :key="item.id || index">
            <CmsLink :link="item.link" size="lg" />
          </li>
        </ul>
      </div>
    </UContainer>
  </section>
</template>
