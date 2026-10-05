import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import { redirects } from './redirects'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const serverURL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'
const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(dirname, '../..'),
  sassOptions: { loadPaths: [path.resolve(dirname, '../../node_modules/@payloadcms/ui/dist/scss/')] },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
    qualities: [100],
    remotePatterns: [{ hostname: new URL(serverURL).hostname, protocol: new URL(serverURL).protocol.slice(0, -1) as 'http' | 'https' }],
  },
  webpack: (config) => {
    config.resolve.extensionAlias = { '.cjs': ['.cts', '.cjs'], '.js': ['.ts', '.tsx', '.js', '.jsx'], '.mjs': ['.mts', '.mjs'] }
    return config
  },
  reactStrictMode: true,
  redirects,
  turbopack: { root: path.resolve(dirname, '../..') },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
