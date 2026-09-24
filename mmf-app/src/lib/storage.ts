const AGE_KEY = 'mmf-age-verified'
const LIKES_KEY = 'mmf-likes'
const USER_KEY = 'mmf-user-type'

export function isAgeVerified(): boolean {
  return localStorage.getItem(AGE_KEY) === '1'
}

export function setAgeVerified(): void {
  localStorage.setItem(AGE_KEY, '1')
}

export function getLikes(): string[] {
  try {
    const raw = localStorage.getItem(LIKES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function toggleLike(id: string): string[] {
  const likes = new Set(getLikes())
  if (likes.has(id)) likes.delete(id)
  else likes.add(id)
  const next = [...likes]
  localStorage.setItem(LIKES_KEY, JSON.stringify(next))
  return next
}

export type UserType = 'couple' | 'male' | null

export function getUserType(): UserType {
  const v = localStorage.getItem(USER_KEY)
  if (v === 'couple' || v === 'male') return v
  return null
}

export function setUserType(type: 'couple' | 'male'): void {
  localStorage.setItem(USER_KEY, type)
}
