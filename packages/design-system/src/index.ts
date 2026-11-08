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

export const adminTokens = {
  primary: '#215073',
  primaryHover: '#1a4060',
  secondary: '#d0b364',
  background: '#f1f5f4',
  surface: '#ffffff',
  text: '#172937',
  muted: '#687280',
  published: '#1f7a4d',
  publishedSoft: '#e5f6ec',
  draft: '#a16207',
  draftSoft: '#fbf3d5',
  archived: '#687280',
  archivedSoft: '#eef1f4',
  darkBg: '#0f1c27',
  darkSurface: '#152838',
} as const

export const adminRadiusTokens = {
  control: '0.5rem',
  card: '0.75rem',
} as const

export const adminFontTokens = {
  sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
} as const

export type BrandTokenName = keyof typeof brandTokens
export type RadiusTokenName = keyof typeof radiusTokens
export type FontTokenName = keyof typeof fontTokens
export type AdminTokenName = keyof typeof adminTokens
export type AdminRadiusTokenName = keyof typeof adminRadiusTokens
export type AdminFontTokenName = keyof typeof adminFontTokens
