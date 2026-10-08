<script setup lang="ts">
import type { CmsPageHero } from '@liskof-digital/types'
import HeroesHighImpact from './HighImpact.vue'
import HeroesLowImpact from './LowImpact.vue'
import HeroesMediumImpact from './MediumImpact.vue'

const props = defineProps<{
  hero?: CmsPageHero | null
}>()

const heroes = {
  highImpact: HeroesHighImpact,
  lowImpact: HeroesLowImpact,
  mediumImpact: HeroesMediumImpact,
} as const

const heroComponent = computed(() => {
  const type = props.hero?.type
  if (!type || type === 'none') return null
  return heroes[type] || null
})
</script>

<template>
  <component :is="heroComponent" v-if="heroComponent && hero" v-bind="hero" />
</template>
