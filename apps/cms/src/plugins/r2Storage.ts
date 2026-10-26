import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'

import { Media } from '@/collections/Media'

/**
 * Store media in Cloudflare R2.
 *
 * This app runs in a Node container, so it uses R2's S3-compatible API.
 * `@payloadcms/storage-r2` only works where a Workers R2 binding exists.
 */
export const r2Storage = (): Plugin => {
  const bucket = process.env.R2_BUCKET || ''
  const endpoint = process.env.R2_ENDPOINT
  const publicURL = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '') || ''
  const configured = Boolean(
    bucket && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && endpoint,
  )

  return s3Storage({
    enabled: process.env.NODE_ENV === 'production' || configured,
    collections: {
      [Media.slug]: publicURL
        ? {
            disablePayloadAccessControl: true,
            generateFileURL: ({ filename, prefix }: { filename: string; prefix?: string }) => {
              const key = prefix ? `${prefix}/${filename}` : filename
              return `${publicURL}/${key}`
            },
          }
        : true,
    },
    bucket,
    config: {
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
      region: 'auto',
      endpoint,
      forcePathStyle: true,
    },
  })
}
