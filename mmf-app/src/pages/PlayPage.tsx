import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { intensityLabel, targetLabel, tasks, type DareTask } from '../data/tasks'
import { clearSession, getSession, saveSession, type Session } from '../lib/storage'

function pickTask(session: Session, excludeId?: string): DareTask | null {
  const pool = tasks.filter((t) => {
    if (excludeId && t.id === excludeId) return false
    if (session.doneIds.includes(t.id)) return false
    if (session.intensity === 'mix') return true
    return t.intensity === session.intensity
  })
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

function resolveTargetName(session: Session, task: DareTask): string {
  if (task.target === 'm1') return session.players.m1
  if (task.target === 'm2') return session.players.m2
  if (task.target === 'f') return session.players.f
  if (task.target === 'pair') return `${session.players.m1} + ${session.players.m2}`
  return 'כולם'
}

export function PlayPage() {
  const initial = getSession()
  const [session, setSession] = useState<Session | null>(initial)
  const [task, setTask] = useState<DareTask | null>(() => (initial ? pickTask(initial) : null))
  const [flash, setFlash] = useState(false)

  const targetName = useMemo(
    () => (session && task ? resolveTargetName(session, task) : ''),
    [session, task],
  )

  if (!session) return <Navigate to="/setup" replace />

  function draw(nextSession = session!, avoidId?: string) {
    const next = pickTask(nextSession, avoidId)
    setTask(next)
    setFlash(true)
    window.setTimeout(() => setFlash(false), 400)
  }

  function done() {
    if (!task || !session) return
    const next: Session = {
      ...session,
      doneIds: [...session.doneIds, task.id],
    }
    saveSession(next)
    setSession(next)
    draw(next)
  }

  function skip() {
    if (!task || !session) return
    draw(session, task.id)
  }

  function resetDeck() {
    if (!session) return
    const next = { ...session, doneIds: [] }
    saveSession(next)
    setSession(next)
    draw(next)
  }

  function endNight() {
    clearSession()
    setSession(null)
  }

  return (
    <div className="bg-atmosphere min-h-svh px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-md flex-col">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-xl text-[var(--champagne)]">MMF</p>
            <p className="text-xs text-[var(--muted)]">
              {session.players.m1} · {session.players.m2} · {session.players.f}
            </p>
          </div>
          <button
            type="button"
            onClick={endNight}
            className="text-xs text-[var(--muted)] hover:text-[var(--cream)]"
          >
            סיום ערב
          </button>
        </header>

        <main className="flex flex-1 flex-col justify-center py-8">
          {!task ? (
            <div className="text-center">
              <p className="font-display text-2xl text-[var(--cream)]">החפיסה נגמרה</p>
              <p className="mt-2 text-sm text-[var(--muted)]">עשיתם את כל המשימות ברמה שבחרתם</p>
              <button
                type="button"
                onClick={resetDeck}
                className="mt-8 bg-[var(--ember)] px-6 py-3 text-sm font-semibold text-[var(--cream)]"
              >
                לערבב מחדש
              </button>
            </div>
          ) : (
            <article
              className={`border border-[var(--line)] px-5 py-8 transition ${
                flash ? 'opacity-40' : 'animate-fade-up opacity-100'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-[var(--ember-hot)]">{intensityLabel[task.intensity]}</span>
                <span className="text-[var(--muted)]">
                  {targetLabel[task.target]} · {targetName}
                </span>
              </div>
              <h1 className="mt-6 font-display text-3xl leading-snug text-[var(--cream)]">
                {task.title}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-[var(--cream)]/85">{task.body}</p>
              <p className="mt-8 text-[11px] leading-relaxed text-[var(--muted)]">
                לא בנוח? דלגו. בלי לחץ. הסכמה לפני ביצוע.
              </p>
            </article>
          )}
        </main>

        {task && (
          <div className="grid grid-cols-2 gap-3 pb-2">
            <button
              type="button"
              onClick={skip}
              className="border border-[var(--line)] py-3.5 text-sm text-[var(--muted)] transition hover:text-[var(--cream)]"
            >
              דלגו
            </button>
            <button
              type="button"
              onClick={done}
              className="bg-[var(--ember)] py-3.5 text-sm font-semibold text-[var(--cream)] transition hover:bg-[var(--ember-hot)]"
            >
              בוצע · הבא
            </button>
          </div>
        )}

        <p className="pt-4 text-center text-[11px] text-[var(--muted)]">
          בוצעו {session.doneIds.length} ·{' '}
          <Link to="/setup" className="text-[var(--champagne)]">
            שינוי הגדרות
          </Link>
        </p>
      </div>
    </div>
  )
}
