type ClassValue = string | number | boolean | null | undefined | ClassDictionary | ClassValue[]

interface ClassDictionary {
  [id: string]: unknown
}

function toClass(value: ClassValue): string {
  if (!value) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(toClass).filter(Boolean).join(' ')
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key)
      .join(' ')
  }
  return ''
}

/** Join class names, filtering falsy values. */
export function cn(...inputs: ClassValue[]): string {
  return inputs.map(toClass).filter(Boolean).join(' ')
}
