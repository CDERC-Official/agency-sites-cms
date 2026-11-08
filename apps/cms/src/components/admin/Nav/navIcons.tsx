import type { ComponentType, SVGProps } from 'react'
import {
  Bars3BottomLeftIcon,
  Bars3Icon,
  DocumentTextIcon,
  NewspaperIcon,
  PhotoIcon,
  TagIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>

export const navIcons: Record<string, HeroIcon> = {
  pages: DocumentTextIcon,
  posts: NewspaperIcon,
  media: PhotoIcon,
  categories: TagIcon,
  users: UsersIcon,
  header: Bars3Icon,
  footer: Bars3BottomLeftIcon,
}
