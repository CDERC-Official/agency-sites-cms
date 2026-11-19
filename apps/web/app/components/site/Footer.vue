<script setup lang="ts">
import type { CmsFooter, CmsSiteSettings } from '@liskof-digital/types'
import { getCmsHref } from '@liskof-digital/utils'

defineProps<{
  footer?: CmsFooter | null
  siteSettings?: CmsSiteSettings | null
}>()
</script>

<template>
  <footer class="mt-auto border-t border-default/60 bg-muted/30">
    <UContainer class="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-col gap-1">
        <NuxtLink to="/" class="font-display text-base font-semibold tracking-tight text-highlighted">
          {{ siteSettings?.businessName || 'Home' }}
        </NuxtLink>
        <p v-if="siteSettings?.tagline" class="text-sm text-muted">
          {{ siteSettings.tagline }}
        </p>
      </div>

      <nav v-if="footer?.navItems?.length" class="flex flex-wrap items-center gap-2">
        <UButton
          v-for="(item, index) in footer.navItems"
          :key="item.id || index"
          :to="getCmsHref(item.link) || undefined"
          :target="item.link.newTab ? '_blank' : undefined"
          :rel="item.link.newTab ? 'noopener noreferrer' : undefined"
          :external="Boolean(item.link.newTab)"
          variant="link"
          color="neutral"
          size="sm"
        >
          {{ item.link.label }}
        </UButton>
      </nav>
    </UContainer>
  </footer>
</template>
