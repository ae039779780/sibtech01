import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { saveSession, type PlayerRole } from '../lib/storage'

const roles: { key: PlayerRole; label: string; short: string }[] = [
  { key: 'm1', label: 'גבר 1', short: 'M' },
  { key: 'm2', label: 'גבר 2', short: 'M' },
  { key: 'f', label: 'אישה', short: 'F' },
]

const levels = [
  { id: 'fire' as const, label: 'נועז', hint: 'חזק' },
  { id: 'spicy' as const, label: 'חריף', hint: 'בינוני' },
  { id: 'warm' as const, label: 'חם', hint: 'קל' },
  { id: 'mix' as const, label: 'מיקס', hint: 'הכל' },
]

export function SetupPage() {
  const navigate = useNavigate()
  const [names, setNames] = useState<Record<PlayerRole, string>>({
    m1: '',
    m2: '',
    f: '',
  })
  const [intensity, setIntensity] = useState<(typeof levels)[number]['id']>('fire')

  function start() {
    saveSession({
      players: {
        m1: names.m1.trim() || 'גבר 1',
        m2: names.m2.trim() || 'גבר 2',
        f: names.f.trim() || 'אישה',
      },
      intensity,
      doneIds: [],
    })
    navigate('/play')
  }

  return (
    <div className="bg-atmosphere min-h-svh px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link to="/" className="text-sm text-[var(--muted)] hover:text-[var(--cream)]">
          ← חזרה
        </Link>

        <p className="mt-6 text-xs tracking-[0.2em] text-[var(--ember-hot)]">MMF</p>
        <h1 className="mt-2 font-display text-4xl text-[var(--cream)]">3 שחקנים</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">גבר · גבר · אישה — רק שמות, בלי פרופילים</p>

        <div className="mt-8 grid grid-cols-3 gap-2">
          {roles.map((role) => (
            <div
              key={role.key}
              className="border border-[var(--line)] px-2 py-3 text-center"
            >
              <span className="font-display text-2xl text-[var(--champagne)]">{role.short}</span>
              <p className="mt-1 text-[11px] text-[var(--muted)]">{role.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {roles.map((role) => (
            <label key={role.key} className="block">
              <span className="text-xs text-[var(--champagne)]">{role.label}</span>
              <input
                value={names[role.key]}
                onChange={(e) => setNames((n) => ({ ...n, [role.key]: e.target.value }))}
                placeholder="שם"
                className="mt-1.5 w-full border border-[var(--line)] bg-transparent px-3 py-3 text-[var(--cream)] outline-none placeholder:text-[var(--muted)]/50 focus:border-[var(--ember)]"
              />
            </label>
          ))}
        </div>

        <h2 className="mt-10 text-sm font-medium text-[var(--cream)]">עוצמה</h2>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {levels.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setIntensity(level.id)}
              className={`py-3 text-center text-xs transition ${
                intensity === level.id
                  ? 'bg-[var(--ember)] text-[var(--cream)]'
                  : 'border border-[var(--line)] text-[var(--muted)]'
              }`}
            >
              <span className="block font-semibold">{level.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={start}
          className="mt-10 w-full bg-[var(--ember)] py-3.5 text-sm font-semibold text-[var(--cream)] transition hover:bg-[var(--ember-hot)]"
        >
          מתחילים · 3 שחקנים
        </button>
      </div>
    </div>
  )
}
