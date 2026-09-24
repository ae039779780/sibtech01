import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { games, type GameMode, type PartyType } from '../lib/games'
import { saveSession, type PlayerRole } from '../lib/storage'

const coupleRoles: { key: PlayerRole; label: string }[] = [
  { key: 'p1', label: 'שחקן/ית 1' },
  { key: 'p2', label: 'שחקן/ית 2' },
]

const mmfRoles: { key: PlayerRole; label: string }[] = [
  { key: 'm1', label: 'גבר 1' },
  { key: 'm2', label: 'גבר 2' },
  { key: 'f', label: 'אישה' },
]

function parseMode(v: string | null): GameMode {
  if (v && games.some((g) => g.id === v)) return v as GameMode
  return 'draw'
}

function parseParty(v: string | null): PartyType {
  return v === 'mmf' ? 'mmf' : 'couple'
}

export function SetupPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const mode = parseMode(params.get('mode'))
  const party = parseParty(params.get('party'))
  const roles = party === 'couple' ? coupleRoles : mmfRoles
  const game = games.find((g) => g.id === mode)

  const [names, setNames] = useState<Partial<Record<PlayerRole, string>>>({})
  const [safeWord, setSafeWord] = useState('אדום')
  const [freePasses, setFreePasses] = useState(3)

  useEffect(() => {
    setNames({})
  }, [party])

  function start() {
    const players: Partial<Record<PlayerRole, string>> = {}
    for (const r of roles) {
      players[r.key] = names[r.key]?.trim() || r.label
    }
    saveSession({
      mode,
      party,
      players,
      intensity: mode === 'heat' ? 'warm' : 'fire',
      doneIds: [],
      safeWord: safeWord.trim() || 'אדום',
      freePasses,
      passesLeft: freePasses,
      heatLevel: 1,
      heatDoneInLevel: 0,
    })
    navigate('/play')
  }

  return (
    <div className="bg-atmosphere min-h-svh px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link to="/" className="text-sm text-[var(--muted)]">
          ← משחקים
        </Link>
        <p className="mt-6 text-xs text-[var(--ember-hot)]">
          {party === 'couple' ? 'זוג' : 'MMF'} · {game?.title}
        </p>
        <h1 className="mt-2 font-display text-3xl text-[var(--cream)]">שחקנים</h1>

        <div className="mt-8 space-y-3">
          {roles.map((role) => (
            <input
              key={`${party}-${role.key}`}
              value={names[role.key] ?? ''}
              onChange={(e) => setNames((n) => ({ ...n, [role.key]: e.target.value }))}
              placeholder={role.label}
              aria-label={role.label}
              className="w-full border border-[var(--line)] bg-transparent px-3 py-3.5 text-[var(--cream)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--ember)]"
            />
          ))}
        </div>

        <label className="mt-8 block">
          <span className="text-xs text-[var(--champagne)]">מילה בטוחה</span>
          <input
            value={safeWord}
            onChange={(e) => setSafeWord(e.target.value)}
            className="mt-1.5 w-full border border-[var(--line)] bg-transparent px-3 py-3 text-[var(--cream)] outline-none focus:border-[var(--ember)]"
          />
        </label>

        <div className="mt-6">
          <p className="text-xs text-[var(--champagne)]">כרטיסי דילוג</p>
          <div className="mt-2 flex gap-2">
            {[1, 3, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setFreePasses(n)}
                className={`flex-1 py-3 text-sm ${
                  freePasses === n
                    ? 'bg-[var(--ember)] text-[var(--cream)]'
                    : 'border border-[var(--line)] text-[var(--muted)]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={start}
          className="mt-10 w-full bg-[var(--ember)] py-3.5 text-sm font-semibold text-[var(--cream)]"
        >
          לשחק · {game?.title}
        </button>
      </div>
    </div>
  )
}
