import { Heart, MessageCircle, Search, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/browse', label: 'גילוי', icon: Search },
  { to: '/matches', label: 'התאמות', icon: Heart },
  { to: '/messages', label: 'הודעות', icon: MessageCircle },
  { to: '/me', label: 'פרופיל', icon: User },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[rgba(12,9,8,0.92)] backdrop-blur-md">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-[11px] transition-colors ${
                  isActive ? 'text-[var(--champagne)]' : 'text-[var(--muted)] hover:text-[var(--cream)]'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
