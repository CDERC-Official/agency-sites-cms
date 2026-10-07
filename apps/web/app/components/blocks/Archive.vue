<script setup lang="ts">
import type { ArchiveBlock, CmsPost } from '@liskof-digital/types'
import { computed } from 'vue'
import CmsCollectionArchive from '../cms/CollectionArchive.vue'
import CmsRichText from '../cms/RichText.vue'

const props = defineProps<{
  id?: string | null
  introContent?: ArchiveBlock['introContent']
  populateBy?: ArchiveBlock['populateBy']
  categories?: ArchiveBlock['categories']
  limit?: ArchiveBlock['limit']
  selectedDocs?: ArchiveBlock['selectedDocs']
}>()

const { getPosts } = usePayload()

const categoryIds = computed(() =>
  (props.categories || [])
    .map((category) => (typeof category === 'object' ? category.id : category))
    .filter((id): id is number => typeof id === 'number'),
)

const { data: posts } = await useAsyncData(
  () => `archive-${props.id || 'block'}-${props.populateBy}-${props.limit}-${categoryIds.value.join(',')}`,
  async () => {
    if (props.populateBy === 'selection') {
      return (props.selectedDocs || [])
        .map((doc) => (typeof doc.value === 'object' ? doc.value : null))
        .filter((post): post is CmsPost => Boolean(post))
    }

    const result = await getPosts({
      depth: 1,
      limit: props.limit || 10,
      ...(categoryIds.value.length
        ? {
            where: {
              categories: {
                in: categoryIds.value,
              },
            },
          }
        : {}),
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        meta: true,
        categories: true,
      },
    })

    return result.docs
  },
)
</script>

<template>
  <section :id="id ? `block-${id}` : undefined" class="flex flex-col gap-10">
    <UContainer v-if="introContent" class="max-w-3xl">
      <CmsRichText :data="introContent" />
    </UContainer>
    <CmsCollectionArchive :posts="posts || []" />
  </section>
</template>
