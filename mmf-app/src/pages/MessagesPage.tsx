import { BottomNav } from '../components/BottomNav'
import { profiles } from '../data/profiles'
import { getLikes } from '../lib/storage'
import { Link } from 'react-router-dom'

const sampleThreads = [
  {
    id: '1',
    preview: 'היי, אהבנו את הפרופיל שלכם. פנויים ביום חמישי?',
    time: 'אתמול',
  },
  {
    id: '3',
    preview: 'נשמע מעניין. בואו נדבר קצת על גבולות לפני שנפגשים.',
    time: 'לפני שעתיים',
  },
]

export function MessagesPage() {
  const likes = getLikes()
  const threads = sampleThreads
    .map((t) => {
      const profile = profiles.find((p) => p.id === t.id)
      return profile ? { ...t, profile } : null
    })
    .filter(Boolean)

  return (
    <div className="bg-atmosphere min-h-svh pb-24">
      <header className="border-b border-[var(--line)] px-5 py-5">
        <h1 className="font-display text-3xl text-[var(--cream)]">הודעות</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">שיחות דיסקרטיות · תצוגת דמו</p>
      </header>

      <main className="mx-auto max-w-lg">
        {threads.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-[var(--muted)]">אין הודעות עדיין</p>
        ) : (
          <ul>
            {threads.map((thread) =>
              thread ? (
                <li key={thread.id} className="border-b border-[var(--line)]">
                  <Link
                    to={`/profile/${thread.profile.id}`}
                    className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/5"
                  >
                    <img
                      src={thread.profile.image}
                      alt=""
                      className="h-14 w-14 object-cover"
                    />
                    <div className="min-w-0 flex-1 text-right">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-[var(--muted)]">{thread.time}</span>
                        <p className="truncate font-medium text-[var(--cream)]">{thread.profile.name}</p>
                      </div>
                      <p className="mt-1 truncate text-sm text-[var(--muted)]">{thread.preview}</p>
                    </div>
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        )}

        {likes.length > 0 && (
          <p className="px-5 py-6 text-center text-xs text-[var(--muted)]">
            יש לכם {likes.length} פרופילים שמורים — פתחו התאמות כדי להמשיך משם
          </p>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
