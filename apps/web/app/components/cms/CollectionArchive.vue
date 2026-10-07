<script setup lang="ts">
import type { CmsPost } from '@liskof-digital/types'
import CmsPostCard from './PostCard.vue'

defineProps<{
  posts: CmsPost[]
}>()
</script>

<template>
  <UContainer>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <CmsPostCard v-for="post in posts" :key="post.id" :post="post" show-categories />
    </div>
  </UContainer>
</template>
