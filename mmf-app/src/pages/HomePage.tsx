import { Link } from 'react-router-dom'
import { games } from '../lib/games'

export function HomePage() {
  return (
    <div className="bg-atmosphere min-h-svh px-5 py-8">
      <div className="mx-auto max-w-lg">
        <p className="font-display text-2xl text-[var(--champagne)]">MMF</p>
        <h1 className="mt-3 font-display text-4xl text-[var(--cream)]">5 משחקים מלאים</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">משימות בלבד · זוג או MMF · לא היכרויות</p>

        <div className="mt-8 space-y-4">
          {games.map((g, i) => (
            <article key={g.id} className="border border-[var(--line)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] text-[var(--ember-hot)]">משחק {i + 1}/5</p>
                  <h2 className="mt-1 font-display text-2xl text-[var(--cream)]">{g.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{g.blurb}</p>
                  <p className="mt-2 text-[11px] text-[var(--champagne)]/80">
                    {g.rounds} תורות · {g.minutes}
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-[11px] text-[var(--muted)]">
                {g.rules.slice(0, 2).map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
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
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
