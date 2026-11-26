<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { getPageBySlug } = usePayload()
const { locale } = useLocale()

const { data: page } = await useAsyncData(
  () => `page-${locale.value}-${slug.value}`,
  () => getPageBySlug(slug.value),
  { watch: [slug, locale] },
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

useCmsSeoMeta(() =>
  page.value
    ? { meta: page.value.meta, title: page.value.title, ogType: 'website' }
    : null,
)
</script>

<template>
  <article v-if="page" class="min-h-screen pb-24">
    <HeroesRenderHero :hero="page.hero" />
    <BlocksRenderBlocks :blocks="page.layout" />
  </article>
</template>
