import { Link } from 'react-router-dom'
import { games, partyOptions } from '../lib/games'

export function HomePage() {
  return (
    <div className="bg-atmosphere min-h-svh px-5 py-8">
      <div className="mx-auto max-w-lg">
        <p className="font-display text-2xl text-[var(--champagne)]">MMF</p>
        <h1 className="mt-3 font-display text-4xl text-[var(--cream)]">משחקים</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">משימות בלבד · זוג או MMF · לא היכרויות</p>

        <h2 className="mt-10 text-xs tracking-wide text-[var(--ember-hot)]">מי משחק</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {partyOptions.map((p) => (
            <div key={p.id} className="border border-[var(--line)] px-3 py-4">
              <p className="font-display text-xl text-[var(--cream)]">{p.title}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{p.blurb}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-xs tracking-wide text-[var(--ember-hot)]">מצבי משחק</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {games.map((g) => (
            <div key={g.id} className="border border-[var(--line)] p-4">
              <p className="font-display text-xl text-[var(--cream)]">{g.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{g.blurb}</p>
              <p className="mt-2 text-[10px] text-[var(--champagne)]/70">בהשראת {g.inspired}</p>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/setup?mode=${g.id}&party=couple`}
                  className="flex-1 bg-[var(--ember)] py-2.5 text-center text-xs font-semibold text-[var(--cream)]"
                >
                  זוג
                </Link>
                <Link
                  to={`/setup?mode=${g.id}&party=mmf`}
                  className="flex-1 border border-[var(--line)] py-2.5 text-center text-xs text-[var(--muted)]"
                >
                  MMF
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
