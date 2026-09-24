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

  function start() {
    saveSession({
      players: {
        m1: names.m1.trim() || 'גבר 1',
        m2: names.m2.trim() || 'גבר 2',
        f: names.f.trim() || 'אישה',
      },
      intensity: 'fire',
      doneIds: [],
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
        <p className="mt-2 text-sm text-[var(--muted)]">{boldTaskCount} משימות נועזות</p>

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
