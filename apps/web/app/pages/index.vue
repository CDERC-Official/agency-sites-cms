<script setup lang="ts">
import type { SiteConfig } from '@liskof-digital/types'
import { normalizeBaseUrl } from '@liskof-digital/utils'

const config = useRuntimeConfig()
const { getPages, getPosts, getCategories } = usePayload()

const site: SiteConfig = {
  name: 'Liskof Digital',
  description: 'Digital experiences powered by Payload CMS and Nuxt.',
}
const cmsUrl = normalizeBaseUrl(config.public.payloadUrl)

const { data, error, pending } = await useAsyncData('home-collections', async () => {
  const [pages, posts, categories] = await Promise.all([
    getPages(),
    getPosts(),
    getCategories(),
  ])

  return {
    pages: pages.docs,
    posts: posts.docs,
    categories: categories.docs,
  }
})
</script>

<template>
  <UContainer class="flex min-h-screen flex-col gap-16 py-20">
    <section class="flex flex-col justify-center gap-8">
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">{{ site.name }}</p>
      <h1 class="max-w-3xl font-display text-5xl font-semibold tracking-tight sm:text-7xl">
        Content and frontend, ready to grow.
      </h1>
      <p class="max-w-2xl text-lg leading-8 text-muted">{{ site.description }}</p>
      <div class="flex flex-wrap items-center gap-4">
        <UButton to="/posts">
          Explore posts
        </UButton>
        <UButton :to="`${cmsUrl}/admin`" variant="link" color="neutral" external>
          Open CMS
        </UButton>
      </div>
    </section>

    <p v-if="pending" class="text-muted">Loading collections…</p>
    <UAlert
      v-else-if="error"
      color="warning"
      variant="subtle"
      title="Could not reach Payload CMS"
      :description="`Confirm it is running at ${cmsUrl} and that content has been seeded.`"
    />

    <template v-else-if="data">
      <section class="flex flex-col gap-4">
        <h2 class="text-2xl font-semibold tracking-tight">Pages</h2>
        <p v-if="data.pages.length === 0" class="text-muted">No published pages yet.</p>
        <ul v-else class="flex flex-col gap-2">
          <li v-for="page in data.pages" :key="page.id">
            <UButton :to="`/${page.slug}`" variant="link" color="primary">
              {{ page.title }}
            </UButton>
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-4">
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="text-2xl font-semibold tracking-tight">Posts</h2>
          <UButton to="/posts" variant="link" size="sm">View all</UButton>
        </div>
        <p v-if="data.posts.length === 0" class="text-muted">No published posts yet.</p>
        <ul v-else class="flex flex-col gap-2">
          <li v-for="post in data.posts" :key="post.id">
            <UButton :to="`/posts/${post.slug}`" variant="link" color="primary">
              {{ post.title }}
            </UButton>
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-2xl font-semibold tracking-tight">Categories</h2>
        <p v-if="data.categories.length === 0" class="text-muted">No categories yet.</p>
        <div v-else class="flex flex-wrap gap-2">
          <UBadge
            v-for="category in data.categories"
            :key="category.id"
            color="neutral"
            variant="subtle"
          >
            {{ category.title }}
          </UBadge>
        </div>
      </section>
    </template>
  </UContainer>
</template>
