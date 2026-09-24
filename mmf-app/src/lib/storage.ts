const AGE_KEY = 'mmf-age-verified'
const SESSION_KEY = 'mmf-session'

export type PlayerRole = 'm1' | 'm2' | 'f'

export type Session = {
  players: Record<PlayerRole, string>
  intensity: 'warm' | 'spicy' | 'fire' | 'mix'
  doneIds: string[]
}

export function isAgeVerified(): boolean {
  return localStorage.getItem(AGE_KEY) === '1'
}

export function setAgeVerified(): void {
  localStorage.setItem(AGE_KEY, '1')
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}
