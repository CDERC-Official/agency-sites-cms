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
  <article v-if="page" class="min-h-screen pb-24">
    <HeroesRenderHero :hero="page.hero" />
    <BlocksRenderBlocks :blocks="page.layout" />
  </article>
</template>
