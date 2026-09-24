import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { saveSession, type PlayerRole } from '../lib/storage'

const roles: { key: PlayerRole; label: string; placeholder: string }[] = [
  { key: 'm1', label: 'גבר 1', placeholder: 'שם' },
  { key: 'm2', label: 'גבר 2', placeholder: 'שם' },
  { key: 'f', label: 'אישה', placeholder: 'שם' },
]

const levels = [
  { id: 'fire' as const, label: 'נועז', hint: 'סצנות חזקות · ברירת מחדל' },
  { id: 'spicy' as const, label: 'חריף', hint: 'בימוי, תורות, מגע מכוון' },
  { id: 'warm' as const, label: 'חם', hint: 'מבטים, דיבור, מגע קל' },
  { id: 'mix' as const, label: 'מיקס', hint: 'הכל מהחפיסה' },
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
    const players = {
      m1: names.m1.trim() || 'גבר 1',
      m2: names.m2.trim() || 'גבר 2',
      f: names.f.trim() || 'אישה',
    }
    saveSession({ players, intensity, doneIds: [] })
    navigate('/play')
  }

  return (
    <div className="bg-atmosphere min-h-svh px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link to="/" className="text-sm text-[var(--muted)] hover:text-[var(--cream)]">
          ← חזרה
        </Link>
        <h1 className="mt-6 font-display text-3xl text-[var(--cream)]">שלושה שחקנים</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">בלי פרופילים. רק שמות לעזר בערב.</p>

        <div className="mt-8 space-y-4">
          {roles.map((role) => (
            <label key={role.key} className="block">
              <span className="text-xs text-[var(--champagne)]">{role.label}</span>
              <input
                value={names[role.key]}
                onChange={(e) => setNames((n) => ({ ...n, [role.key]: e.target.value }))}
                placeholder={role.placeholder}
                className="mt-1.5 w-full border border-[var(--line)] bg-transparent px-3 py-3 text-[var(--cream)] outline-none placeholder:text-[var(--muted)]/50 focus:border-[var(--ember)]"
              />
            </label>
          ))}
        </div>

        <h2 className="mt-10 font-display text-xl text-[var(--cream)]">עוצמה</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {levels.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setIntensity(level.id)}
              className={`px-3 py-4 text-right transition ${
                intensity === level.id
                  ? 'bg-[var(--ember)] text-[var(--cream)]'
                  : 'border border-[var(--line)] text-[var(--muted)]'
              }`}
            >
              <span className="block text-sm font-semibold">{level.label}</span>
              <span className="mt-1 block text-[11px] opacity-80">{level.hint}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={start}
          className="mt-10 w-full bg-[var(--ember)] py-3.5 text-sm font-semibold text-[var(--cream)] transition hover:bg-[var(--ember-hot)]"
        >
          לשלוף משימה
        </button>
      </div>
    </div>
  )
}
