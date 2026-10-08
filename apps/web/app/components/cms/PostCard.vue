<script setup lang="ts">
import type { CmsPost } from '@liskof-digital/types'
import { computed } from 'vue'
import CmsMedia from './Media.vue'

const props = defineProps<{
  post: CmsPost
  showCategories?: boolean
}>()

const href = computed(() => `/posts/${props.post.slug}`)
const image = computed(() =>
  props.post.meta?.image && typeof props.post.meta.image === 'object'
    ? props.post.meta.image
    : null,
)
const categories = computed(() =>
  (props.post.categories || [])
    .filter((category): category is { id: number; title: string; slug: string } => typeof category === 'object')
    .map((category) => category.title),
)
const description = computed(() => props.post.meta?.description?.replace(/\s/g, ' ') || '')
</script>

<template>
  <NuxtLink :to="href" class="group block h-full">
    <UCard
      class="h-full transition-colors group-hover:ring-2 group-hover:ring-primary/20"
      :ui="{ body: 'p-0 sm:p-0 flex h-full flex-col' }"
    >
      <div class="relative aspect-[16/10] w-full bg-muted">
        <CmsMedia v-if="image" class="h-full w-full" img-class="h-full w-full object-cover" :resource="image" />
        <div v-else class="flex h-full items-center justify-center text-sm text-muted">
          No image
        </div>
      </div>
      <div class="flex flex-1 flex-col gap-2 p-4">
        <p v-if="showCategories && categories.length" class="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {{ categories.join(', ') }}
        </p>
        <h3 class="font-display text-xl font-semibold tracking-tight text-highlighted group-hover:text-primary">
          {{ post.title }}
        </h3>
        <p v-if="description" class="text-sm leading-6 text-muted">{{ description }}</p>
      </div>
    </UCard>
  </NuxtLink>
</template>
