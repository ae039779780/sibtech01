import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { boldTaskCount } from '../data/tasks'
import { saveSession, type PlayerRole } from '../lib/storage'

const roles: { key: PlayerRole; label: string }[] = [
  { key: 'm1', label: 'גבר 1' },
  { key: 'm2', label: 'גבר 2' },
  { key: 'f', label: 'אישה' },
]

export function SetupPage() {
  const navigate = useNavigate()
  const [names, setNames] = useState<Record<PlayerRole, string>>({ m1: '', m2: '', f: '' })
  const [safeWord, setSafeWord] = useState('אדום')
  const [freePasses, setFreePasses] = useState(3)

  function start() {
    saveSession({
      players: {
        m1: names.m1.trim() || 'גבר 1',
        m2: names.m2.trim() || 'גבר 2',
        f: names.f.trim() || 'אישה',
      },
      intensity: 'fire',
      doneIds: [],
      safeWord: safeWord.trim() || 'אדום',
      freePasses,
      passesLeft: freePasses,
    })
    navigate('/play')
  }

  return (
    <div className="bg-atmosphere min-h-svh px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link to="/" className="text-sm text-[var(--muted)]">
          ← חזרה
        </Link>
        <h1 className="mt-6 font-display text-3xl text-[var(--cream)]">3 שחקנים</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{boldTaskCount} משימות · טיימר · מילה בטוחה</p>

        <div className="mt-8 space-y-3">
          {roles.map((role) => (
            <input
              key={role.key}
              value={names[role.key]}
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
          <p className="text-xs text-[var(--champagne)]">כרטיסי דילוג לערב</p>
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
          לשחק
        </button>
      </div>
    </div>
  )
}
