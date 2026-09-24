import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { ProfileCard } from '../components/ProfileCard'
import { profiles } from '../data/profiles'
import { getLikes, toggleLike } from '../lib/storage'

export function MatchesPage() {
  const [likes, setLikes] = useState(() => getLikes())
  const matched = profiles.filter((p) => likes.includes(p.id))

  return (
    <div className="bg-atmosphere min-h-svh pb-24">
      <header className="border-b border-[var(--line)] px-5 py-5">
        <h1 className="font-display text-3xl text-[var(--cream)]">התאמות</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">פרופילים ששמרתם — התחילו שיחה משם</p>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {matched.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl text-[var(--champagne)]">עדיין ריק כאן</p>
            <p className="mt-3 text-sm text-[var(--muted)]">שמרו פרופילים מגילוי כדי לראות אותם כאן</p>
            <Link
              to="/browse"
              className="mt-8 inline-block bg-[var(--ember)] px-6 py-3 text-sm font-semibold text-[var(--cream)]"
            >
              לגילוי
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {matched.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                liked
                onLike={() => setLikes(toggleLike(profile.id))}
              />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
