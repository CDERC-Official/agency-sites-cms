<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))

await navigateTo(`/${slug.value}`, { redirectCode: 301 })
</script>

<template>
  <div />
</template>
