<script setup lang="ts">
const { getPosts } = usePayload()

const { data, error, pending } = await useAsyncData('posts-list', () => getPosts())

useSeoMeta({
  title: 'Posts',
  description: 'Latest posts from Payload CMS.',
})
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-20">
    <div class="flex flex-col gap-4">
      <NuxtLink class="text-sm font-medium text-brand-accent" to="/">← Home</NuxtLink>
      <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Posts</h1>
      <p class="max-w-2xl text-lg text-brand-muted">Published posts from Payload CMS.</p>
    </div>

    <p v-if="pending" class="text-brand-muted">Loading posts…</p>
    <p v-else-if="error" class="text-brand-muted">Could not load posts from Payload CMS.</p>
    <p v-else-if="!data?.docs.length" class="text-brand-muted">No published posts yet.</p>
    <ul v-else class="flex flex-col gap-6">
      <li v-for="post in data.docs" :key="post.id" class="flex flex-col gap-1">
        <NuxtLink
          class="text-xl font-medium text-brand-ink underline decoration-brand-accent underline-offset-4"
          :to="`/posts/${post.slug}`"
        >
          {{ post.title }}
        </NuxtLink>
        <p v-if="post.meta?.description" class="text-brand-muted">{{ post.meta.description }}</p>
        <p v-if="post.publishedAt" class="text-sm text-brand-muted">
          {{ new Date(post.publishedAt).toLocaleDateString() }}
        </p>
      </li>
    </ul>
  </main>
</template>
