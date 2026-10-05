import tailwindcss from '@tailwindcss/vite'
import { sharedNuxtConfig } from '@liskof-digital/config/nuxt'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  ...sharedNuxtConfig,
  compatibilityDate: '2025-07-15',
  workspaceDir: fileURLToPath(new URL('../..', import.meta.url)),
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    transpile: ['@liskof-digital/ui', '@liskof-digital/types', '@liskof-digital/utils'],
  },
  runtimeConfig: {
    payloadApiToken: '',
    public: {
      payloadUrl: 'http://localhost:3000',
    },
  },
  nitro: {
    preset: 'cloudflare',
  },
})
