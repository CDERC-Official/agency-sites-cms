/** Remove trailing slashes while preserving a URL's optional base path. */
export function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}
