import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { tasks, type DareTask, type TaskTarget } from '../data/tasks'
import { clearSession, getSession, saveSession, type PlayerRole, type Session } from '../lib/storage'

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

function isSeatActive(target: TaskTarget, seat: PlayerRole): boolean {
  if (target === 'all') return true
  if (target === 'pair') return seat === 'm1' || seat === 'm2'
  return target === seat
}

export function PlayPage() {
  const initial = getSession()
  const [session, setSession] = useState<Session | null>(initial)
  const [task, setTask] = useState<DareTask | null>(() => (initial ? pickTask(initial) : null))

  const targetName = useMemo(
    () => (session && task ? resolveTargetName(session, task) : ''),
    [session, task],
  )

  if (!session) return <Navigate to="/setup" replace />

  const seats: { key: PlayerRole; label: string }[] = [
    { key: 'm1', label: session.players.m1 },
    { key: 'm2', label: session.players.m2 },
    { key: 'f', label: session.players.f },
  ]

  function draw(nextSession = session!, avoidId?: string) {
    setTask(pickTask(nextSession, avoidId))
  }

  function done() {
    if (!task || !session) return
    const next: Session = { ...session, doneIds: [...session.doneIds, task.id] }
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

  return (
    <div className="bg-atmosphere min-h-svh px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-md flex-col">
        <header className="flex items-center justify-between">
          <p className="font-display text-xl text-[var(--champagne)]">MMF</p>
          <button
            type="button"
            onClick={() => {
              clearSession()
              setSession(null)
            }}
            className="text-xs text-[var(--muted)]"
          >
            סיום
          </button>
        </header>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {seats.map((seat) => {
            const active = task ? isSeatActive(task.target, seat.key) : false
            return (
              <div
                key={seat.key}
                className={`truncate px-2 py-2 text-center text-xs ${
                  active
                    ? 'bg-[var(--ember)] text-[var(--cream)]'
                    : 'border border-[var(--line)] text-[var(--muted)]'
                }`}
              >
                {seat.label}
              </div>
            )
          })}
        </div>

        <main className="flex flex-1 flex-col justify-center py-10">
          {!task ? (
            <div className="text-center">
              <p className="text-[var(--cream)]">נגמר</p>
              <button
                type="button"
                onClick={resetDeck}
                className="mt-6 bg-[var(--ember)] px-6 py-3 text-sm text-[var(--cream)]"
              >
                מחדש
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-[var(--ember-hot)]">{targetName}</p>
              <h1 className="mt-3 font-display text-3xl text-[var(--cream)]">{task.title}</h1>
              <p className="mt-4 text-sm leading-relaxed text-[var(--cream)]/85">{task.body}</p>
            </div>
          )}
        </main>

        {task && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={skip}
              className="border border-[var(--line)] py-3.5 text-sm text-[var(--muted)]"
            >
              דלג
            </button>
            <button
              type="button"
              onClick={done}
              className="bg-[var(--ember)] py-3.5 text-sm font-semibold text-[var(--cream)]"
            >
              הבא
            </button>
          </div>
        )}

        <p className="pt-5 text-center text-[11px] text-[var(--muted)]">
          <Link to="/setup">שחקנים</Link>
        </p>
      </div>
    </div>
  )
}
