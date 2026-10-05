import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const appDir = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(appDir, '.env.local') })
loadEnv({ path: resolve(appDir, '.env') })

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] }), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['../../vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
  },
})
