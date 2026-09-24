import { BadgeCheck, ArrowRight, Heart } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { profiles, seekingLabel } from '../data/profiles'
import { getLikes, toggleLike } from '../lib/storage'

export function ProfilePage() {
  const { id } = useParams()
  const profile = profiles.find((p) => p.id === id)
  const [likes, setLikes] = useState(() => getLikes())
  const liked = useMemo(() => (id ? likes.includes(id) : false), [likes, id])

  if (!profile) {
    return (
      <div className="bg-atmosphere flex min-h-svh flex-col items-center justify-center gap-4 px-6">
        <p className="text-[var(--muted)]">הפרופיל לא נמצא</p>
        <Link to="/browse" className="text-[var(--champagne)]">
          חזרה לגילוי
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-atmosphere min-h-svh pb-24">
      <div className="relative h-[58svh] min-h-[320px] overflow-hidden">
        <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-black/30" />
        <Link
          to="/browse"
          className="absolute right-4 top-4 flex items-center gap-1 bg-black/40 px-3 py-2 text-sm text-[var(--cream)] backdrop-blur-sm"
        >
          <ArrowRight size={16} />
          חזרה
        </Link>
      </div>

      <main className="relative z-10 -mt-16 px-5">
        <div className="mx-auto max-w-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {profile.verified && <BadgeCheck className="text-[var(--champagne)]" size={20} />}
                <h1 className="font-display text-3xl text-[var(--cream)]">{profile.name}</h1>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {profile.ages} · {profile.city}
                {profile.online ? ' · מחוברים עכשיו' : ''}
              </p>
              <p className="mt-2 text-sm text-[var(--ember-hot)]">{seekingLabel[profile.seeking]}</p>
            </div>
            <button
              type="button"
              onClick={() => setLikes(toggleLike(profile.id))}
              className={`flex h-12 w-12 items-center justify-center transition ${
                liked ? 'bg-[var(--ember)] text-[var(--cream)]' : 'border border-[var(--line)] text-[var(--muted)]'
              }`}
              aria-label="שמירה"
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>

          <p className="mt-6 font-display text-xl text-[var(--champagne)]">{profile.tagline}</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--cream)]/85">{profile.bio}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {profile.interests.map((tag) => (
              <span
                key={tag}
                className="border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            to="/messages"
            className="mt-8 block bg-[var(--ember)] py-3.5 text-center text-sm font-semibold text-[var(--cream)] transition hover:bg-[var(--ember-hot)]"
          >
            שליחת הודעה
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
