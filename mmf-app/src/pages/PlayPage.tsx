import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  daresCouple,
  daresMmf,
  diceAction,
  diceHeat,
  diceWhoCouple,
  diceWhoMmf,
  directorHow,
  directorWhat,
  directorWhere,
  directorWho,
  heatLevels,
  truthsCouple,
  truthsMmf,
} from '../data/fullGames'
import { tasks } from '../data/tasks'
import { getGame } from '../lib/games'
import { clearSession, getSession, saveSession, type Session } from '../lib/storage'

type Card = { title: string; body: string; meta?: string }

function rnd<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function pickIndex(length: number, used: number[]): number {
  const free = Array.from({ length }, (_, i) => i).filter((i) => !used.includes(i))
  if (free.length === 0) return Math.floor(Math.random() * length)
  return rnd(free)
}

function durationOf(text: string): number {
  const m = text.match(/(\d+)\s*שנ/)
  return m ? Math.min(180, Math.max(20, Number(m[1]))) : 60
}

function playerLabel(session: Session): string {
  if (session.party === 'couple') {
    return `${session.players.p1} · ${session.players.p2}`
  }
  return `${session.players.m1} · ${session.players.m2} · ${session.players.f}`
}

function drawNight(session: Session): Card {
  if (session.party === 'couple') {
    const d = rnd(daresCouple)
    return { title: d.title, body: d.body, meta: 'משימה' }
  }
  const t = rnd(tasks)
  return { title: t.title, body: t.body, meta: 'משימה נועזת' }
}

function drawTod(session: Session, kind: 'truth' | 'dare'): { card: Card; truthIdx?: number; dareIdx?: number } {
  if (kind === 'truth') {
    const pool = session.party === 'couple' ? truthsCouple : truthsMmf
    const idx = pickIndex(pool.length, session.usedTruthIdx)
    return {
      card: { title: 'אמת', body: pool[idx]!, meta: 'ענו בקול' },
      truthIdx: idx,
    }
  }
  const pool = session.party === 'couple' ? daresCouple : daresMmf
  const idx = pickIndex(pool.length, session.usedDareIdx)
  const d = pool[idx]!
  return {
    card: { title: d.title, body: d.body, meta: 'משימה' },
    dareIdx: idx,
  }
}

function drawHeat(session: Session): Card {
  const level = heatLevels[Math.min(session.heatLevel, 5) - 1]!
  const item = rnd(level.items)
  return {
    title: item.title,
    body: item.body,
    meta: `רמה ${level.level} · ${level.name}`,
  }
}

function drawDice(session: Session): { card: Card; line: string } {
  const who = rnd(session.party === 'couple' ? diceWhoCouple : diceWhoMmf)
  const heat = rnd(diceHeat)
  const action = rnd(diceAction)
  const line = `${who} · ${heat} · ${action}`
  const pool = session.party === 'couple' ? daresCouple : daresMmf
  const d = rnd(pool)
  return {
    line,
    card: {
      title: d.title,
      body: `${d.body} (לפי הקוביות: ${action}, רמת ${heat})`,
      meta: line,
    },
  }
}

function drawDirector(): { card: Card; line: string } {
  const line = `${rnd(directorWho)} · ${rnd(directorWhat)} · ${rnd(directorHow)} · ${rnd(directorWhere)}`
  return {
    line,
    card: {
      title: 'תסריט',
      body: `${line}. אשרו בקול — ואז מבצעים כ־60 שניות.`,
      meta: 'הבמאי',
    },
  }
}

export function PlayPage() {
  const initial = getSession()
  const [session, setSession] = useState<Session | null>(initial)
  const [card, setCard] = useState<Card | null>(null)
  const [line, setLine] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [left, setLeft] = useState(60)
  const [stopped, setStopped] = useState(false)
  const [finished, setFinished] = useState(false)
  const [needChoice, setNeedChoice] = useState(false)

  const game = useMemo(() => getGame(session?.mode), [session?.mode])

  useEffect(() => {
    if (!session) return
    if (session.mode === 'tod') {
      setNeedChoice(true)
      setCard(null)
      return
    }
    deal(session)
  }, [])

  useEffect(() => {
    if (!card) return
    setLeft(durationOf(card.body))
    setRunning(false)
    setStopped(false)
  }, [card?.title, card?.body])

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

  if (!session) return <Navigate to="/" replace />

  function persist(next: Session) {
    saveSession(next)
    setSession(next)
  }

  function deal(s: Session, todKind?: 'truth' | 'dare') {
    setStopped(false)
    setNeedChoice(false)
    if (s.mode === 'night') {
      setLine(null)
      setCard(drawNight(s))
      return
    }
    if (s.mode === 'dice') {
      const r = drawDice(s)
      setLine(r.line)
      setCard(r.card)
      return
    }
    if (s.mode === 'tod') {
      const kind = todKind ?? 'dare'
      const r = drawTod(s, kind)
      setLine(null)
      setCard(r.card)
      const next = { ...s }
      if (r.truthIdx != null) next.usedTruthIdx = [...s.usedTruthIdx, r.truthIdx]
      if (r.dareIdx != null) next.usedDareIdx = [...s.usedDareIdx, r.dareIdx]
      persist(next)
      return
    }
    if (s.mode === 'heat') {
      setLine(null)
      setCard(drawHeat(s))
      return
    }
    const r = drawDirector()
    setLine(r.line)
    setCard(r.card)
  }

  function advance() {
    if (!session) return
    const nextRound = session.round + 1
    if (nextRound >= session.roundsGoal) {
      setFinished(true)
      setCard(null)
      persist({ ...session, round: nextRound })
      return
    }
    let next: Session = { ...session, round: nextRound }
    if (session.mode === 'heat') {
      const level = Math.min(5, Math.floor(nextRound / 3) + 1)
      next = { ...next, heatLevel: level }
    }
    persist(next)
    if (session.mode === 'tod') {
      setNeedChoice(true)
      setCard(null)
      setLine(null)
      return
    }
    deal(next)
  }

  function usePass() {
    if (!session || session.passesLeft <= 0) return
    const next = { ...session, passesLeft: session.passesLeft - 1 }
    persist(next)
    if (session.mode === 'tod') {
      setNeedChoice(true)
      setCard(null)
      return
    }
    deal(next)
  }

  const progress = Math.min(100, Math.round((session.round / session.roundsGoal) * 100))
  const timerLabel = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`

  if (finished) {
    return (
      <div className="bg-atmosphere flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-4xl text-[var(--champagne)]">סיום</p>
        <h1 className="mt-4 font-display text-3xl text-[var(--cream)]">{game.title}</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          הושלמו {session.roundsGoal} תורות · {playerLabel(session)}
        </p>
        <Link to="/" className="mt-10 bg-[var(--ember)] px-8 py-3.5 text-sm font-semibold text-[var(--cream)]">
          למשחקים
        </Link>
        <button
          type="button"
          onClick={() => {
            const next = {
              ...session,
              round: 0,
              passesLeft: session.freePasses,
              heatLevel: 1,
              usedTruthIdx: [],
              usedDareIdx: [],
            }
            persist(next)
            setFinished(false)
            if (next.mode === 'tod') {
              setNeedChoice(true)
              setCard(null)
            } else deal(next)
          }}
          className="mt-4 text-sm text-[var(--muted)]"
        >
          לשחק שוב
        </button>
      </div>
    )
  }

  return (
    <div className="bg-atmosphere min-h-svh px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-md flex-col">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-xl text-[var(--champagne)]">{game.title}</p>
            <p className="text-[11px] text-[var(--muted)]">
              תור {Math.min(session.round + 1, session.roundsGoal)}/{session.roundsGoal}
              {session.mode === 'heat' ? ` · רמה ${session.heatLevel}/5` : ''}
              {' · '}
              {session.party === 'couple' ? 'זוג' : 'MMF'}
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
            יציאה
          </button>
        </header>

        <div className="mt-3 h-1.5 overflow-hidden bg-[var(--line)]">
          <div className="h-full bg-[var(--ember)] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <p className="mt-3 truncate text-center text-[11px] text-[var(--muted)]">{playerLabel(session)}</p>
        <p className="mt-1 text-center text-[11px] text-[var(--muted)]">
          מילה בטוחה: <span className="text-[var(--champagne)]">{session.safeWord}</span> · דילוגים {session.passesLeft}
        </p>

        <main className="flex flex-1 flex-col justify-center py-8">
          {needChoice ? (
            <div className="text-center">
              <p className="font-display text-2xl text-[var(--cream)]">אמת או משימה?</p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => deal(session, 'truth')}
                  className="border border-[var(--line)] py-4 text-sm text-[var(--muted)]"
                >
                  אמת
                </button>
                <button
                  type="button"
                  onClick={() => deal(session, 'dare')}
                  className="bg-[var(--ember)] py-4 text-sm font-semibold text-[var(--cream)]"
                >
                  משימה
                </button>
              </div>
            </div>
          ) : stopped ? (
            <div className="text-center">
              <p className="font-display text-2xl text-[var(--cream)]">עצרנו</p>
              <button
                type="button"
                onClick={() => {
                  if (session.mode === 'tod') {
                    setNeedChoice(true)
                    setCard(null)
                    setStopped(false)
                  } else deal(session)
                }}
                className="mt-6 bg-[var(--ember)] px-6 py-3 text-sm text-[var(--cream)]"
              >
                כרטיס אחר
              </button>
            </div>
          ) : !card ? (
            <div className="text-center">
              <button type="button" onClick={() => deal(session)} className="bg-[var(--ember)] px-6 py-3 text-sm text-[var(--cream)]">
                שליפה
              </button>
            </div>
          ) : (
            <div>
              {line && <p className="text-sm text-[var(--ember-hot)]">{line}</p>}
              {card.meta && !line && <p className="text-xs text-[var(--ember-hot)]">{card.meta}</p>}
              <h1 className="mt-3 font-display text-3xl text-[var(--cream)]">{card.title}</h1>
              <p className="mt-4 text-sm leading-relaxed text-[var(--cream)]/85">{card.body}</p>

              {card.meta !== 'ענו בקול' && (
                <div className="mt-8 flex items-center justify-between gap-4">
                  <p className={`font-display text-4xl tabular-nums ${left === 0 ? 'text-[var(--ember-hot)]' : 'text-[var(--champagne)]'}`}>
                    {timerLabel}
                  </p>
                  {!running ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (left === 0) setLeft(durationOf(card.body))
                        setRunning(true)
                      }}
                      className="bg-[var(--ember)] px-4 py-2 text-sm text-[var(--cream)]"
                    >
                      טיימר
                    </button>
                  ) : (
                    <button type="button" onClick={() => setRunning(false)} className="border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)]">
                      השהה
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {card && !stopped && !needChoice && (
          <div className="space-y-3 pb-2">
            <button
              type="button"
              onClick={() => {
                setRunning(false)
                setStopped(true)
              }}
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
                דילוג
              </button>
              <button type="button" onClick={advance} className="bg-[var(--ember)] py-3.5 text-sm font-semibold text-[var(--cream)]">
                בוצע · הבא
              </button>
            </div>
          </div>
        )}

        <p className="pt-4 text-center text-[11px] text-[var(--muted)]">
          <Link to="/">5 המשחקים</Link>
        </p>
      </div>
    </div>
  )
}
