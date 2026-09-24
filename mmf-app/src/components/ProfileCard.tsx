import { seekingLabel, type Profile } from '../data/profiles'
import { BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

type Props = {
  profile: Profile
  liked?: boolean
  onLike?: () => void
}

export function ProfileCard({ profile, liked, onLike }: Props) {
  return (
    <article className="group relative overflow-hidden rounded-none">
      <Link to={`/profile/${profile.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={profile.image}
            alt={profile.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,9,8,0.95)] via-[rgba(12,9,8,0.25)] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-4 text-right">
            <div className="flex items-center justify-end gap-2">
              {profile.online && (
                <span className="animate-soft-pulse h-2 w-2 rounded-full bg-emerald-400" title="מחובר/ת" />
              )}
              {profile.verified && <BadgeCheck size={16} className="text-[var(--champagne)]" />}
              <h3 className="font-display text-xl text-[var(--cream)]">{profile.name}</h3>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {profile.ages} · {profile.city}
            </p>
            <p className="text-xs tracking-wide text-[var(--ember-hot)]">{seekingLabel[profile.seeking]}</p>
            <p className="line-clamp-2 text-sm text-[var(--cream)]/85">{profile.tagline}</p>
          </div>
        </div>
      </Link>
      {onLike && (
        <button
          type="button"
          onClick={onLike}
          aria-label={liked ? 'הסר לייק' : 'לייק'}
          className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition ${
            liked
              ? 'bg-[var(--ember)] text-[var(--cream)]'
              : 'bg-black/40 text-[var(--cream)] hover:bg-[var(--ember)]/80'
          }`}
        >
          {liked ? 'נשמר ★' : 'שמירה'}
        </button>
      )}
    </article>
  )
}
