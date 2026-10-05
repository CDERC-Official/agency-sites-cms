import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, devices } from '@playwright/test'

const appDir = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(appDir, '.env.local') })
loadEnv({ path: resolve(appDir, '.env') })

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chromium' } }],
  webServer: {
    command: 'pnpm dev',
    cwd: appDir,
    reuseExistingServer: !process.env.CI,
    url: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  },
})
