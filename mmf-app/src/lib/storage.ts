const AGE_KEY = 'mmf-age-verified'
const SESSION_KEY = 'mmf-session'

export type PlayerRole = 'm1' | 'm2' | 'f' | 'p1' | 'p2'
export type GameMode = 'night' | 'dice' | 'tod' | 'heat' | 'director'
export type PartyType = 'couple' | 'mmf'

export type Session = {
  mode: GameMode
  party: PartyType
  players: Partial<Record<PlayerRole, string>>
  safeWord: string
  freePasses: number
  passesLeft: number
  round: number
  roundsGoal: number
  heatLevel: number
  usedTruthIdx: number[]
  usedDareIdx: number[]
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
    const p = JSON.parse(raw) as Partial<Session>
    if (!p.mode || !p.party || !p.players) return null
    return {
      mode: p.mode,
      party: p.party,
      players: p.players,
      safeWord: p.safeWord?.trim() || 'אדום',
      freePasses: p.freePasses ?? 3,
      passesLeft: p.passesLeft ?? p.freePasses ?? 3,
      round: p.round ?? 0,
      roundsGoal: p.roundsGoal ?? 12,
      heatLevel: p.heatLevel ?? 1,
      usedTruthIdx: p.usedTruthIdx ?? [],
      usedDareIdx: p.usedDareIdx ?? [],
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
