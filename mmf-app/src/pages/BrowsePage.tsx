import { useMemo, useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { ProfileCard } from '../components/ProfileCard'
import { profiles, type Seeking } from '../data/profiles'
import { getLikes, toggleLike } from '../lib/storage'

const filters: { id: Seeking | 'all'; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'couple-seeking-male', label: 'זוגות' },
  { id: 'male-seeking-couple', label: 'גברים' },
  { id: 'open-mmf', label: 'פתוחים' },
]

export function BrowsePage() {
  const [filter, setFilter] = useState<Seeking | 'all'>('all')
  const [likes, setLikes] = useState<string[]>(() => getLikes())

  const list = useMemo(
    () => (filter === 'all' ? profiles : profiles.filter((p) => p.seeking === filter)),
    [filter],
  )

  return (
    <div className="bg-atmosphere min-h-svh pb-24">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(12,9,8,0.9)] px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-end justify-between gap-4">
          <div>
            <p className="font-display text-2xl text-[var(--champagne)]">MMF</p>
            <p className="text-xs text-[var(--muted)]">גילוי פרופילים בסביבתכם</p>
          </div>
        </div>
        <div className="mx-auto mt-4 flex max-w-3xl gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 px-3.5 py-1.5 text-xs transition ${
                filter === f.id
                  ? 'bg-[var(--ember)] text-[var(--cream)]'
                  : 'border border-[var(--line)] text-[var(--muted)] hover:text-[var(--cream)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto grid max-w-3xl grid-cols-1 gap-6 px-4 py-6 sm:grid-cols-2">
        {list.map((profile, i) => (
          <div
            key={profile.id}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <ProfileCard
              profile={profile}
              liked={likes.includes(profile.id)}
              onLike={() => setLikes(toggleLike(profile.id))}
            />
          </div>
        ))}
      </main>
      <BottomNav />
    </div>
  )
}
