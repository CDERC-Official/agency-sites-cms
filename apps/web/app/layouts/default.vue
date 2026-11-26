<script setup lang="ts">
const { data } = await useSiteChrome()

useLocalBusinessJsonLd(() => data.value?.siteSettings)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader :header="data?.header" :site-settings="data?.siteSettings" />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter :footer="data?.footer" :site-settings="data?.siteSettings" />
  </div>
</template>
