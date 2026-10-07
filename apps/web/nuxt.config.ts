import tailwindcss from '@tailwindcss/vite'
import { sharedNuxtConfig } from '@liskof-digital/config/nuxt'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  ...sharedNuxtConfig,
  compatibilityDate: '2025-07-15',
  workspaceDir: fileURLToPath(new URL('../..', import.meta.url)),
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=Syne:wght@500;600;700&display=swap',
        },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ['@nuxt/ui'],
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },
  build: {
    transpile: [
      '@liskof-digital/types',
      '@liskof-digital/utils',
      '@liskof-digital/design-system',
    ],
  },

  runtimeConfig: {
    payloadApiToken: '',
    public: {
      payloadUrl: 'http://localhost:3000',
    },
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      nodeCompat: true,
      wrangler: {
        name: 'agency-sites-web',
      },
    },
  },
})
