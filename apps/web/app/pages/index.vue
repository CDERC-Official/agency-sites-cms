<script setup lang="ts">
import { UiButton } from '@liskof-digital/ui'
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
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-6 py-20">
    <section class="flex flex-col justify-center gap-8">
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">{{ site.name }}</p>
      <h1 class="max-w-3xl text-5xl font-semibold tracking-tight sm:text-7xl">
        Content and frontend, ready to grow.
      </h1>
      <p class="max-w-2xl text-lg leading-8 text-brand-muted">{{ site.description }}</p>
      <div class="flex flex-wrap items-center gap-4">
        <NuxtLink to="/posts">
          <UiButton>Explore posts</UiButton>
        </NuxtLink>
        <a class="font-medium text-brand-ink underline decoration-brand-accent underline-offset-4" :href="`${cmsUrl}/admin`">
          Open CMS
        </a>
      </div>
    </section>

    <p v-if="pending" class="text-brand-muted">Loading collections…</p>
    <p v-else-if="error" class="text-brand-muted">
      Could not reach Payload CMS. Confirm it is running at
      <span class="font-medium text-brand-ink">{{ cmsUrl }}</span>
      and that content has been seeded.
    </p>

    <template v-else-if="data">
      <section class="flex flex-col gap-4">
        <h2 class="text-2xl font-semibold tracking-tight">Pages</h2>
        <p v-if="data.pages.length === 0" class="text-brand-muted">No published pages yet.</p>
        <ul v-else class="flex flex-col gap-2">
          <li v-for="page in data.pages" :key="page.id">
            <NuxtLink
              class="font-medium text-brand-ink underline decoration-brand-accent underline-offset-4"
              :to="`/pages/${page.slug}`"
            >
              {{ page.title }}
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-4">
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="text-2xl font-semibold tracking-tight">Posts</h2>
          <NuxtLink class="text-sm font-medium text-brand-accent" to="/posts">View all</NuxtLink>
        </div>
        <p v-if="data.posts.length === 0" class="text-brand-muted">No published posts yet.</p>
        <ul v-else class="flex flex-col gap-2">
          <li v-for="post in data.posts" :key="post.id">
            <NuxtLink
              class="font-medium text-brand-ink underline decoration-brand-accent underline-offset-4"
              :to="`/posts/${post.slug}`"
            >
              {{ post.title }}
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-2xl font-semibold tracking-tight">Categories</h2>
        <p v-if="data.categories.length === 0" class="text-brand-muted">No categories yet.</p>
        <ul v-else class="flex flex-wrap gap-x-4 gap-y-2">
          <li v-for="category in data.categories" :key="category.id" class="text-brand-muted">
            {{ category.title }}
          </li>
        </ul>
      </section>
    </template>
  </main>
</template>
