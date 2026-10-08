<script setup lang="ts">
const { getPosts } = usePayload()

const { data, error, pending } = await useAsyncData('posts-list', () => getPosts())

useSeoMeta({
  title: 'Posts',
  description: 'Latest posts from Payload CMS.',
})
</script>

<template>
  <UContainer class="flex min-h-screen flex-col gap-10 py-20">
    <div class="flex flex-col gap-4">
      <UButton to="/" variant="link" color="primary" size="sm">
        ← Home
      </UButton>
      <h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Posts</h1>
      <p class="max-w-2xl text-lg text-muted">Published posts from Payload CMS.</p>
    </div>

    <p v-if="pending" class="text-muted">Loading posts…</p>
    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      title="Could not load posts"
      description="Could not load posts from Payload CMS."
    />
    <p v-else-if="!data?.docs.length" class="text-muted">No published posts yet.</p>
    <ul v-else class="flex flex-col gap-6">
      <li v-for="post in data.docs" :key="post.id" class="flex flex-col gap-1">
        <UButton
          :to="`/posts/${post.slug}`"
          variant="link"
          color="primary"
          class="justify-start text-xl font-medium"
        >
          {{ post.title }}
        </UButton>
        <p v-if="post.meta?.description" class="text-muted">{{ post.meta.description }}</p>
        <p v-if="post.publishedAt" class="text-sm text-muted">
          {{ new Date(post.publishedAt).toLocaleDateString() }}
        </p>
      </li>
    </ul>
  </UContainer>
</template>
