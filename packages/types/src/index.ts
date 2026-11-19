export interface SiteConfig {
  name: string
  description: string
}

export const OPTIONAL_TENANT_COLLECTION_SLUGS = ['events'] as const

export type OptionalTenantCollectionSlug = (typeof OPTIONAL_TENANT_COLLECTION_SLUGS)[number]

export interface Tenant {
  id: number
  name: string
  domain?: string | null
  slug: string
  allowPublicRead?: boolean | null
  enabledCollections?: OptionalTenantCollectionSlug[] | null
}

export function tenantHasCollection(
  tenant: Pick<Tenant, 'enabledCollections'> | null | undefined,
  slug: OptionalTenantCollectionSlug,
): boolean {
  return Boolean(tenant?.enabledCollections?.includes(slug))
}

export interface PaginatedResult<T> {
  docs: T[]
  totalDocs: number
  limit: number
  page: number | null
  totalPages: number
}

export interface LexicalNode {
  type: string
  version?: number
  children?: LexicalNode[]
  text?: string
  format?: number | string
  style?: string
  tag?: string
  listType?: string
  url?: string
  newTab?: boolean
  fields?: Record<string, unknown>
  relationTo?: string
  value?: unknown
  [key: string]: unknown
}

export interface LexicalRichText {
  root: LexicalNode
  [key: string]: unknown
}

export interface CmsMeta {
  title?: string | null
  description?: string | null
  image?: number | CmsMedia | null
}

export interface CmsMedia {
  id: number
  alt?: string | null
  caption?: LexicalRichText | null
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
  sizes?: Record<
    string,
    {
      url?: string | null
      width?: number | null
      height?: number | null
      mimeType?: string | null
      filename?: string | null
    } | null
  > | null
}

export interface CmsLink {
  type?: ('reference' | 'custom') | null
  newTab?: boolean | null
  reference?:
    | {
        relationTo: 'pages' | 'posts'
        value: number | { id?: number; slug?: string | null; title?: string }
      }
    | null
  url?: string | null
  label: string
  appearance?: ('default' | 'outline') | null
}

export interface CmsCategory {
  id: number
  title: string
  slug: string
}

export interface CmsPost {
  id: number
  title: string
  slug: string
  publishedAt?: string | null
  meta?: CmsMeta | null
  categories?: (number | CmsCategory)[] | null
  content?: LexicalRichText | null
  heroImage?: number | CmsMedia | null
  _status?: ('draft' | 'published') | null
}

export type CmsEventFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type CmsEventEnds = 'never' | 'onDate' | 'afterCount'

export interface CmsEvent {
  id: number
  title: string
  slug: string
  startDate: string
  endDate?: string | null
  allDay?: boolean | null
  isRecurring?: boolean | null
  frequency?: CmsEventFrequency | null
  interval?: number | null
  ends?: CmsEventEnds | null
  until?: string | null
  count?: number | null
  location?: string | null
  publishedAt?: string | null
  meta?: CmsMeta | null
  content?: LexicalRichText | null
  heroImage?: number | CmsMedia | null
  _status?: ('draft' | 'published') | null
}

export interface CmsEventOccurrence {
  event: CmsEvent
  occurrenceStart: Date
  occurrenceEnd: Date | null
}

export interface CmsFormFieldOption {
  label: string
  value: string
  id?: string | null
}

export type CmsFormField =
  | {
      blockType: 'checkbox'
      name: string
      label?: string | null
      width?: number | null
      required?: boolean | null
      defaultValue?: boolean | null
      id?: string | null
    }
  | {
      blockType: 'country' | 'state' | 'email' | 'number' | 'text' | 'textarea'
      name: string
      label?: string | null
      width?: number | null
      required?: boolean | null
      defaultValue?: string | number | null
      id?: string | null
    }
  | {
      blockType: 'select'
      name: string
      label?: string | null
      width?: number | null
      required?: boolean | null
      defaultValue?: string | null
      placeholder?: string | null
      options?: CmsFormFieldOption[] | null
      id?: string | null
    }
  | {
      blockType: 'message'
      message?: LexicalRichText | null
      id?: string | null
    }

export interface CmsForm {
  id: number
  title: string
  fields?: CmsFormField[] | null
  submitButtonLabel?: string | null
  confirmationType?: ('message' | 'redirect') | null
  confirmationMessage?: LexicalRichText | null
  redirect?: { url: string } | null
}

export interface CallToActionBlock {
  blockType: 'cta'
  id?: string | null
  blockName?: string | null
  richText?: LexicalRichText | null
  links?: { link: CmsLink; id?: string | null }[] | null
}

export interface ContentBlock {
  blockType: 'content'
  id?: string | null
  blockName?: string | null
  columns?:
    | {
        size?: ('oneThird' | 'half' | 'twoThirds' | 'full') | null
        richText?: LexicalRichText | null
        enableLink?: boolean | null
        link?: CmsLink
        id?: string | null
      }[]
    | null
}

export interface MediaBlock {
  blockType: 'mediaBlock'
  id?: string | null
  blockName?: string | null
  media: number | CmsMedia
}

export interface ArchiveBlock {
  blockType: 'archive'
  id?: string | null
  blockName?: string | null
  introContent?: LexicalRichText | null
  populateBy?: ('collection' | 'selection') | null
  relationTo?: 'posts' | null
  categories?: (number | CmsCategory)[] | null
  limit?: number | null
  selectedDocs?: { relationTo: 'posts'; value: number | CmsPost }[] | null
}

export interface FormBlock {
  blockType: 'formBlock'
  id?: string | null
  blockName?: string | null
  form: number | CmsForm
  enableIntro?: boolean | null
  introContent?: LexicalRichText | null
}

export type PageLayoutBlock =
  | CallToActionBlock
  | ContentBlock
  | MediaBlock
  | ArchiveBlock
  | FormBlock

export interface CmsPageHero {
  type: 'none' | 'highImpact' | 'mediumImpact' | 'lowImpact'
  richText?: LexicalRichText | null
  links?: { link: CmsLink; id?: string | null }[] | null
  media?: number | CmsMedia | null
}

export interface CmsPage {
  id: number
  title: string
  slug: string
  publishedAt?: string | null
  meta?: CmsMeta | null
  hero?: CmsPageHero | null
  layout?: PageLayoutBlock[] | null
  _status?: ('draft' | 'published') | null
}

export interface CmsNavItem {
  link: CmsLink
  id?: string | null
}

export interface CmsHeader {
  id: number
  navItems?: CmsNavItem[] | null
}

export interface CmsFooter {
  id: number
  navItems?: CmsNavItem[] | null
}

export interface CmsSiteSettings {
  id: number
  businessName: string
  tagline?: string | null
  logo?: number | CmsMedia | null
  favicon?: number | CmsMedia | null
  contact?: {
    email?: string | null
    phone?: string | null
    address?: string | null
    website?: string | null
  } | null
}

export interface PayloadQuery {
  depth?: number
  limit?: number
  page?: number
  sort?: string
  pagination?: boolean
  where?: Record<string, unknown>
  select?: Record<string, boolean | Record<string, unknown>>
}
