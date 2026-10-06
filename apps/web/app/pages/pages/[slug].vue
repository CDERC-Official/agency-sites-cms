<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { getPageBySlug } = usePayload()

const { data: page } = await useAsyncData(
  () => `page-${slug.value}`,
  () => getPageBySlug(slug.value),
  { watch: [slug] },
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

useSeoMeta({
  title: page.value.meta?.title || page.value.title,
  description: page.value.meta?.description || undefined,
})
</script>

<template>
  <main v-if="page" class="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-20">
    <div class="flex flex-col gap-4">
      <NuxtLink class="text-sm font-medium text-brand-accent" to="/">← Home</NuxtLink>
      <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">{{ page.title }}</h1>
      <p v-if="page.publishedAt" class="text-sm text-brand-muted">
        {{ new Date(page.publishedAt).toLocaleDateString() }}
      </p>
    </div>
    <p v-if="page.meta?.description" class="max-w-2xl text-lg leading-8 text-brand-muted">
      {{ page.meta.description }}
    </p>
    <p class="text-sm text-brand-muted">Slug: {{ page.slug }}</p>
  </main>
</template>
