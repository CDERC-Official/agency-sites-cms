<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { getPostBySlug } = usePayload()

const { data: post } = await useAsyncData(
  () => `post-${slug.value}`,
  () => getPostBySlug(slug.value),
  { watch: [slug] },
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

useSeoMeta({
  title: post.value.meta?.title || post.value.title,
  description: post.value.meta?.description || undefined,
})
</script>

<template>
  <UContainer v-if="post" class="flex min-h-screen flex-col gap-8 py-20">
    <div class="flex flex-col gap-4">
      <UButton to="/posts" variant="link" color="primary" size="sm">
        ← Posts
      </UButton>
      <h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{{ post.title }}</h1>
      <p v-if="post.publishedAt" class="text-sm text-muted">
        {{ new Date(post.publishedAt).toLocaleDateString() }}
      </p>
    </div>
    <p v-if="post.meta?.description" class="max-w-2xl text-lg leading-8 text-muted">
      {{ post.meta.description }}
    </p>
    <p class="text-sm text-muted">Slug: {{ post.slug }}</p>
  </UContainer>
</template>
