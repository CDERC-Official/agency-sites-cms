export const brandTokens = {
  accent: '#c2410c',
  ink: '#172033',
  muted: '#586174',
  paper: '#f8f7f4',
} as const

export type BrandTokenName = keyof typeof brandTokens
