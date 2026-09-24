import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { boldTaskCount, tasks, type DareTask, type TaskTarget } from '../data/tasks'
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

/** שניות מהטקסט, או 60 כברירת מחדל — כמו טיימרים ב־TicTease / Frisky */
function durationOf(task: DareTask): number {
  const match = task.body.match(/(\d+)\s*שנ/)
  if (match) return Math.min(180, Math.max(20, Number(match[1])))
  return 60
}

export function PlayPage() {
  const initial = getSession()
  const [session, setSession] = useState<Session | null>(initial)
  const [task, setTask] = useState<DareTask | null>(() => (initial ? pickTask(initial) : null))
  const [running, setRunning] = useState(false)
  const [left, setLeft] = useState(60)
  const [stopped, setStopped] = useState(false)

  const targetName = useMemo(
    () => (session && task ? resolveTargetName(session, task) : ''),
    [session, task],
  )

  useEffect(() => {
    if (!task) return
    setLeft(durationOf(task))
    setRunning(false)
    setStopped(false)
  }, [task])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  if (!session) return <Navigate to="/setup" replace />

  const seats: { key: PlayerRole; label: string }[] = [
    { key: 'm1', label: session.players.m1 },
    { key: 'm2', label: session.players.m2 },
    { key: 'f', label: session.players.f },
  ]

  const total = boldTaskCount
  const done = session.doneIds.length
  const progress = Math.min(100, Math.round((done / total) * 100))

  function draw(nextSession = session!, avoidId?: string) {
    setTask(pickTask(nextSession, avoidId))
  }

  function doneTask() {
    if (!task || !session) return
    const next: Session = { ...session, doneIds: [...session.doneIds, task.id] }
    saveSession(next)
    setSession(next)
    draw(next)
  }

  function usePass() {
    if (!task || !session || session.passesLeft <= 0) return
    const next: Session = { ...session, passesLeft: session.passesLeft - 1 }
    saveSession(next)
    setSession(next)
    draw(next, task.id)
  }

  function safeStop() {
    setRunning(false)
    setStopped(true)
  }

  function resetDeck() {
    if (!session) return
    const next = { ...session, doneIds: [], passesLeft: session.freePasses }
    saveSession(next)
    setSession(next)
    draw(next)
  }

  const timerLabel = `${String(Math.floor(left / 60)).padStart(1, '0')}:${String(left % 60).padStart(2, '0')}`

  return (
    <div className="bg-atmosphere min-h-svh px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-md flex-col">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-xl text-[var(--champagne)]">MMF</p>
            <p className="text-[11px] text-[var(--muted)]">
              {done}/{total} · דילוגים {session.passesLeft}
            </p>
          </div>
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

        <div className="mt-3 h-1 overflow-hidden bg-[var(--line)]">
          <div className="h-full bg-[var(--ember)] transition-all" style={{ width: `${progress}%` }} />
        </div>

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

        <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
          מילה בטוחה: <span className="text-[var(--champagne)]">{session.safeWord}</span>
        </p>

        <main className="flex flex-1 flex-col justify-center py-8">
          {!task ? (
            <div className="text-center">
              <p className="font-display text-2xl text-[var(--cream)]">נגמר</p>
              <button
                type="button"
                onClick={resetDeck}
                className="mt-6 bg-[var(--ember)] px-6 py-3 text-sm text-[var(--cream)]"
              >
                מחדש
              </button>
            </div>
          ) : stopped ? (
            <div className="text-center">
              <p className="font-display text-2xl text-[var(--cream)]">עצרנו</p>
              <p className="mt-2 text-sm text-[var(--muted)]">נאמרה מילה בטוחה / עצירה</p>
              <button
                type="button"
                onClick={() => draw(session, task.id)}
                className="mt-6 bg-[var(--ember)] px-6 py-3 text-sm text-[var(--cream)]"
              >
                משימה אחרת
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-[var(--ember-hot)]">{targetName}</p>
              <h1 className="mt-3 font-display text-3xl text-[var(--cream)]">{task.title}</h1>
              <p className="mt-4 text-sm leading-relaxed text-[var(--cream)]/85">{task.body}</p>

              <div className="mt-8 flex items-center justify-between gap-4">
                <p
                  className={`font-display text-4xl tabular-nums ${
                    left === 0 ? 'text-[var(--ember-hot)]' : 'text-[var(--champagne)]'
                  }`}
                >
                  {timerLabel}
                </p>
                <div className="flex gap-2">
                  {!running ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (left === 0) setLeft(durationOf(task))
                        setRunning(true)
                      }}
                      className="bg-[var(--ember)] px-4 py-2 text-sm text-[var(--cream)]"
                    >
                      {left === 0 ? 'שוב' : 'התחל טיימר'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRunning(false)}
                      className="border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)]"
                    >
                      השהה
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {task && !stopped && (
          <div className="space-y-3 pb-2">
            <button
              type="button"
              onClick={safeStop}
              className="w-full border border-[var(--ember)]/60 py-3 text-sm text-[var(--ember-hot)]"
            >
              עצירה · {session.safeWord}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={usePass}
                disabled={session.passesLeft <= 0}
                className="border border-[var(--line)] py-3.5 text-sm text-[var(--muted)] disabled:opacity-30"
              >
                כרטיס דילוג
              </button>
              <button
                type="button"
                onClick={doneTask}
                className="bg-[var(--ember)] py-3.5 text-sm font-semibold text-[var(--cream)]"
              >
                בוצע · הבא
              </button>
            </div>
          </div>
        )}

        <p className="pt-4 text-center text-[11px] text-[var(--muted)]">
          <Link to="/setup">הגדרות</Link>
        </p>
      </div>
    </div>
  )
}
