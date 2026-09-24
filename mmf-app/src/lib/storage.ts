const AGE_KEY = 'mmf-age-verified'
const SESSION_KEY = 'mmf-session'

export type PlayerRole = 'm1' | 'm2' | 'f'

export type Session = {
  players: Record<PlayerRole, string>
  intensity: 'warm' | 'spicy' | 'fire' | 'mix'
  doneIds: string[]
  safeWord: string
  freePasses: number
  passesLeft: number
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
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Session>
    if (!parsed.players) return null
    return {
      players: parsed.players,
      intensity: parsed.intensity ?? 'fire',
      doneIds: parsed.doneIds ?? [],
      safeWord: parsed.safeWord?.trim() || 'אדום',
      freePasses: parsed.freePasses ?? 3,
      passesLeft: parsed.passesLeft ?? parsed.freePasses ?? 3,
    }
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
