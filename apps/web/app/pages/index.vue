<script setup lang="ts">
import { UiButton } from '@liskof-digital/ui'
import type { SiteConfig } from '@liskof-digital/types'
import { normalizeBaseUrl } from '@liskof-digital/utils'

const config = useRuntimeConfig()
const site: SiteConfig = {
  name: 'Liskof Digital',
  description: 'Digital experiences powered by Payload CMS and Nuxt.',
}
const cmsUrl = normalizeBaseUrl(config.public.payloadUrl)
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-6 py-20">
    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">{{ site.name }}</p>
    <h1 class="max-w-3xl text-5xl font-semibold tracking-tight sm:text-7xl">
      Content and frontend, ready to grow.
    </h1>
    <p class="max-w-2xl text-lg leading-8 text-brand-muted">{{ site.description }}</p>
    <div class="flex flex-wrap items-center gap-4">
      <UiButton>Explore the site</UiButton>
      <a class="font-medium text-brand-ink underline decoration-brand-accent underline-offset-4" :href="`${cmsUrl}/admin`">
        Open CMS
      </a>
    </div>
  </main>
</template>
