import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { coupleTasks, type CoupleTask } from '../data/coupleTasks'
import {
  diceAction,
  diceHeat,
  diceWhoCouple,
  diceWhoMmf,
  scenarioHow,
  scenarioWhat,
  scenarioWho,
} from '../data/modesMeta'
import { boldTaskCount, tasks, type DareTask } from '../data/tasks'
import { games } from '../lib/games'
import { clearSession, getSession, saveSession, type Session } from '../lib/storage'

type Card = {
  id: string
  title: string
  body: string
  who: string
  kind?: string
}

function rnd<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function durationOf(text: string): number {
  const m = text.match(/(\d+)\s*שנ/)
  if (m) return Math.min(180, Math.max(20, Number(m[1])))
  return 60
}

function heatIntensity(level: number): 'warm' | 'spicy' | 'fire' {
  if (level <= 2) return 'warm'
  if (level <= 4) return 'spicy'
  return 'fire'
}

function playerName(session: Session, key: string): string {
  return session.players[key as keyof typeof session.players] || key
}

function seats(session: Session): { key: string; label: string }[] {
  if (session.party === 'couple') {
    return [
      { key: 'p1', label: playerName(session, 'p1') },
      { key: 'p2', label: playerName(session, 'p2') },
    ]
  }
  return [
    { key: 'm1', label: playerName(session, 'm1') },
    { key: 'm2', label: playerName(session, 'm2') },
    { key: 'f', label: playerName(session, 'f') },
  ]
}

function resolveCoupleWho(session: Session, t: CoupleTask): string {
  if (t.target === 'p1') return playerName(session, 'p1')
  if (t.target === 'p2') return playerName(session, 'p2')
  return 'שניכם'
}

function resolveMmfWho(session: Session, t: DareTask): string {
  if (t.target === 'm1') return playerName(session, 'm1')
  if (t.target === 'm2') return playerName(session, 'm2')
  if (t.target === 'f') return playerName(session, 'f')
  if (t.target === 'pair') return `${playerName(session, 'm1')} + ${playerName(session, 'm2')}`
  return 'כולם'
}

function pickCouple(session: Session, kind?: 'dare' | 'truth', intensity?: 'warm' | 'spicy' | 'fire'): CoupleTask | null {
  const pool = coupleTasks.filter((t) => {
    if (session.doneIds.includes(t.id)) return false
    if (kind && t.kind !== kind) return false
    if (intensity && t.intensity !== intensity) return false
    return true
  })
  return pool.length ? rnd(pool) : null
}

function pickMmf(session: Session, intensity?: 'warm' | 'spicy' | 'fire'): DareTask | null {
  const pool = tasks.filter((t) => {
    if (session.doneIds.includes(t.id)) return false
    if (intensity && t.intensity !== intensity) return false
    return true
  })
  return pool.length ? rnd(pool) : null
}

function toCard(session: Session, raw: CoupleTask | DareTask): Card {
  if ('kind' in raw) {
    return {
      id: raw.id,
      title: raw.title,
      body: raw.body,
      who: resolveCoupleWho(session, raw),
      kind: raw.kind === 'truth' ? 'אמת' : 'משימה',
    }
  }
  return {
    id: raw.id,
    title: raw.title,
    body: raw.body,
    who: resolveMmfWho(session, raw),
    kind: 'משימה',
  }
}

function drawForMode(session: Session, preferTruth?: boolean): Card | null {
  const heat = session.mode === 'heat' ? heatIntensity(session.heatLevel) : undefined

  if (session.mode === 'truth') {
    if (session.party === 'couple') {
      const kind = preferTruth ? 'truth' : Math.random() < 0.45 ? 'truth' : 'dare'
      const t = pickCouple(session, kind) || pickCouple(session)
      return t ? toCard(session, t) : null
    }
    const t = pickMmf(session)
    return t ? toCard(session, t) : null
  }

  if (session.party === 'couple') {
    const t = pickCouple(session, 'dare', heat)
    return t ? toCard(session, t) : null
  }
  const forceFire = session.mode === 'draw' || session.mode === 'wheel'
  const t = pickMmf(session, heat ?? (forceFire ? 'fire' : undefined))
  return t ? toCard(session, t) : null
}

export function PlayPage() {
  const initial = getSession()
  const [session, setSession] = useState<Session | null>(initial)
  const [card, setCard] = useState<Card | null>(() => (initial ? drawForMode(initial) : null))
  const [diceLine, setDiceLine] = useState<string | null>(null)
  const [scenarioLine, setScenarioLine] = useState<string | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [running, setRunning] = useState(false)
  const [left, setLeft] = useState(60)
  const [stopped, setStopped] = useState(false)
  const [truthPick, setTruthPick] = useState<'truth' | 'dare' | null>(null)

  const game = useMemo(() => games.find((g) => g.id === session?.mode), [session?.mode])

  useEffect(() => {
    if (!card) return
    setLeft(durationOf(card.body))
    setRunning(false)
    setStopped(false)
  }, [card?.id])

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

  const seatList = seats(session)
  const total = session.party === 'couple' ? coupleTasks.length : boldTaskCount
  const done = session.doneIds.length
  const progress = Math.min(100, Math.round((done / Math.max(1, total)) * 100))

  function persist(next: Session) {
    saveSession(next)
    setSession(next)
  }

  function nextCard(nextSession = session!, preferTruth?: boolean) {
    const c = drawForMode(nextSession, preferTruth)
    setCard(c)
    setDiceLine(null)
    setScenarioLine(null)
    setTruthPick(null)
  }

  function complete() {
    if (!card || !session) return
    let next: Session = { ...session, doneIds: [...session.doneIds, card.id] }
    if (session.mode === 'heat') {
      const inLevel = session.heatDoneInLevel + 1
      if (inLevel >= 3 && session.heatLevel < 5) {
        next = { ...next, heatLevel: session.heatLevel + 1, heatDoneInLevel: 0, intensity: heatIntensity(session.heatLevel + 1) }
      } else {
        next = { ...next, heatDoneInLevel: inLevel }
      }
    }
    persist(next)
    nextCard(next)
  }

  function usePass() {
    if (!card || !session || session.passesLeft <= 0) return
    const next = { ...session, passesLeft: session.passesLeft - 1 }
    persist(next)
    nextCard(next)
  }

  function rollDice() {
    if (!session) return
    const who = rnd(session.party === 'couple' ? diceWhoCouple : diceWhoMmf)
    const heat = rnd(diceHeat)
    const action = rnd(diceAction)
    setDiceLine(`${who} · ${heat} · ${action}`)
    const intensity = heat === 'חם' ? 'warm' : heat === 'חריף' ? 'spicy' : 'fire'
    if (session.party === 'couple') {
      const t = pickCouple({ ...session, doneIds: session.doneIds }, 'dare', intensity) || pickCouple(session, 'dare')
      if (t) setCard(toCard(session, t))
    } else {
      const t = pickMmf({ ...session, doneIds: session.doneIds }, intensity) || pickMmf(session)
      if (t) setCard(toCard(session, t))
    }
  }

  function buildScenario() {
    const line = `${rnd(scenarioWho)} · ${rnd(scenarioWhat)} · ${rnd(scenarioHow)}`
    setScenarioLine(line)
    setCard({
      id: `sc-${Date.now()}`,
      title: 'תסריט הערב',
      body: `${line}. מבצעים כ־60 שניות אחרי שכולם אמרו כן.`,
      who: 'לפי התסריט',
      kind: 'תסריט',
    })
  }

  function spinWheel() {
    if (!session) return
    setSpinning(true)
    window.setTimeout(() => {
      nextCard(session)
      setSpinning(false)
    }, 900)
  }

  function chooseTruthDare(kind: 'truth' | 'dare') {
    if (!session) return
    setTruthPick(kind)
    nextCard(session, kind === 'truth')
  }

  const timerLabel = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`

  return (
    <div className="bg-atmosphere min-h-svh px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-md flex-col">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-xl text-[var(--champagne)]">MMF</p>
            <p className="text-[11px] text-[var(--muted)]">
              {game?.title} · {session.party === 'couple' ? 'זוג' : 'MMF'} · {done}/{total}
              {session.mode === 'heat' ? ` · רמה ${session.heatLevel}/5` : ''}
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

        <div className={`mt-4 grid gap-2 ${seatList.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {seatList.map((s) => (
            <div key={s.key} className="truncate border border-[var(--line)] px-2 py-2 text-center text-xs text-[var(--cream)]">
              {s.label}
            </div>
          ))}
        </div>

        <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
          מילה בטוחה: <span className="text-[var(--champagne)]">{session.safeWord}</span> · דילוגים {session.passesLeft}
        </p>

        {/* Mode controls */}
        <div className="mt-4 flex flex-wrap gap-2">
          {session.mode === 'dice' && (
            <button type="button" onClick={rollDice} className="bg-[var(--ember)] px-4 py-2 text-xs text-[var(--cream)]">
              הטלת קוביות
            </button>
          )}
          {session.mode === 'scenario' && (
            <button type="button" onClick={buildScenario} className="bg-[var(--ember)] px-4 py-2 text-xs text-[var(--cream)]">
              הגרלת תסריט
            </button>
          )}
          {session.mode === 'wheel' && (
            <button type="button" onClick={spinWheel} className="bg-[var(--ember)] px-4 py-2 text-xs text-[var(--cream)]">
              סובב גלגל
            </button>
          )}
          {session.mode === 'truth' && (
            <>
              <button type="button" onClick={() => chooseTruthDare('truth')} className="border border-[var(--line)] px-4 py-2 text-xs text-[var(--muted)]">
                אמת
              </button>
              <button type="button" onClick={() => chooseTruthDare('dare')} className="bg-[var(--ember)] px-4 py-2 text-xs text-[var(--cream)]">
                משימה
              </button>
            </>
          )}
          {(session.mode === 'draw' || session.mode === 'heat') && (
            <button type="button" onClick={() => nextCard(session)} className="border border-[var(--line)] px-4 py-2 text-xs text-[var(--muted)]">
              שליפה חדשה
            </button>
          )}
        </div>

        {diceLine && <p className="mt-3 text-center text-sm text-[var(--ember-hot)]">{diceLine}</p>}
        {scenarioLine && <p className="mt-3 text-center text-sm text-[var(--ember-hot)]">{scenarioLine}</p>}
        {truthPick && <p className="mt-3 text-center text-xs text-[var(--muted)]">נבחר: {truthPick === 'truth' ? 'אמת' : 'משימה'}</p>}

        <main className="flex flex-1 flex-col justify-center py-8">
          {spinning ? (
            <p className="animate-soft-pulse text-center font-display text-3xl text-[var(--champagne)]">מסתובב…</p>
          ) : stopped ? (
            <div className="text-center">
              <p className="font-display text-2xl text-[var(--cream)]">עצרנו</p>
              <button type="button" onClick={() => nextCard(session)} className="mt-6 bg-[var(--ember)] px-6 py-3 text-sm text-[var(--cream)]">
                משימה אחרת
              </button>
            </div>
          ) : !card ? (
            <div className="text-center">
              <p className="text-[var(--cream)]">נגמר / שלפו שוב</p>
              <button
                type="button"
                onClick={() => {
                  const next = { ...session, doneIds: [], passesLeft: session.freePasses, heatLevel: 1, heatDoneInLevel: 0 }
                  persist(next)
                  nextCard(next)
                }}
                className="mt-6 bg-[var(--ember)] px-6 py-3 text-sm text-[var(--cream)]"
              >
                מחדש
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-[var(--ember-hot)]">
                {card.kind ? `${card.kind} · ` : ''}
                {card.who}
              </p>
              <h1 className="mt-3 font-display text-3xl text-[var(--cream)]">{card.title}</h1>
              <p className="mt-4 text-sm leading-relaxed text-[var(--cream)]/85">{card.body}</p>

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
                    {left === 0 ? 'שוב' : 'טיימר'}
                  </button>
                ) : (
                  <button type="button" onClick={() => setRunning(false)} className="border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)]">
                    השהה
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {card && !stopped && !spinning && (
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
                כרטיס דילוג
              </button>
              <button type="button" onClick={complete} className="bg-[var(--ember)] py-3.5 text-sm font-semibold text-[var(--cream)]">
                בוצע · הבא
              </button>
            </div>
          </div>
        )}

        <p className="pt-4 text-center text-[11px] text-[var(--muted)]">
          <Link to="/">כל המשחקים</Link>
        </p>
      </div>
    </div>
  )
}
