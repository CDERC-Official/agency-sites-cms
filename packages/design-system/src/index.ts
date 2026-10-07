export const brandTokens = {
  accent: '#c2410c',
  ink: '#172033',
  muted: '#586174',
  paper: '#f8f7f4',
  surface: '#ffffff',
  line: 'color-mix(in oklab, #172033 12%, transparent)',
} as const

export const radiusTokens = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.8rem',
  xl: '1rem',
} as const

export const fontTokens = {
  sans: "'Source Sans 3', ui-sans-serif, system-ui, sans-serif",
  display: "'Syne', 'Source Sans 3', ui-sans-serif, system-ui, sans-serif",
} as const

export type BrandTokenName = keyof typeof brandTokens
export type RadiusTokenName = keyof typeof radiusTokens
export type FontTokenName = keyof typeof fontTokens
