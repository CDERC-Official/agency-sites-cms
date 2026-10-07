<script setup lang="ts">
import type { CmsLink, CmsMedia, LexicalRichText } from '@liskof-digital/types'

defineProps<{
  richText?: LexicalRichText | null
  links?: { link: CmsLink; id?: string | null }[] | null
  media?: number | CmsMedia | null
}>()
</script>

<template>
  <section class="py-16">
    <UContainer class="flex flex-col gap-8">
      <div class="max-w-3xl">
        <CmsRichText v-if="richText" :data="richText" />
        <ul v-if="links?.length" class="mt-6 flex flex-wrap gap-4">
          <li v-for="(item, index) in links" :key="item.id || index">
            <CmsLink :link="item.link" size="lg" />
          </li>
        </ul>
      </div>

      <div v-if="media && typeof media === 'object'">
        <CmsMedia
          class="-mx-4 md:-mx-8"
          img-class="w-full rounded-lg"
          priority
          :resource="media"
        />
        <CmsRichText
          v-if="media.caption"
          class="mt-3 text-sm text-muted"
          :data="media.caption"
          :enable-prose="false"
        />
      </div>
    </UContainer>
  </section>
</template>
