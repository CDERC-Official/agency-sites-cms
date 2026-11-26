<script setup lang="ts">
import type { CmsHeader, CmsSiteSettings } from '@liskof-digital/types'
import { getCmsHref } from '@liskof-digital/utils'

defineProps<{
  header?: CmsHeader | null
  siteSettings?: CmsSiteSettings | null
}>()

const { locale, locales, localeLabels, setLocale, showLanguageSwitcher } = useLocale()
</script>

<template>
  <header class="border-b border-default/60 bg-default/80 backdrop-blur">
    <UContainer class="flex items-center justify-between gap-6 py-5">
      <NuxtLink to="/" class="flex min-w-0 items-center gap-3 text-highlighted">
        <CmsMedia
          v-if="siteSettings?.logo && typeof siteSettings.logo === 'object'"
          :resource="siteSettings.logo"
          class="h-8 w-auto shrink-0"
          img-class="h-8 w-auto object-contain"
          size="thumbnail"
        />
        <span class="truncate font-display text-lg font-semibold tracking-tight">
          {{ siteSettings?.businessName || 'Home' }}
        </span>
      </NuxtLink>

      <div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <nav v-if="header?.navItems?.length" class="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <UButton
            v-for="(item, index) in header.navItems"
            :key="item.id || index"
            :to="getCmsHref(item.link) || undefined"
            :target="item.link.newTab ? '_blank' : undefined"
            :rel="item.link.newTab ? 'noopener noreferrer' : undefined"
            :external="Boolean(item.link.newTab)"
            variant="ghost"
            color="neutral"
            size="sm"
          >
            {{ item.link.label }}
          </UButton>
        </nav>

        <div
          v-if="showLanguageSwitcher"
          class="flex items-center gap-1 border-l border-default/60 pl-2 sm:pl-3"
          role="group"
          aria-label="Language"
        >
          <UButton
            v-for="code in locales"
            :key="code"
            :variant="locale === code ? 'soft' : 'ghost'"
            :color="locale === code ? 'primary' : 'neutral'"
            size="xs"
            :aria-pressed="locale === code"
            @click="setLocale(code)"
          >
            {{ localeLabels[code] }}
          </UButton>
        </div>
      </div>
    </UContainer>
  </header>
</template>
