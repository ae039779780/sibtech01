import { BottomNav } from '../components/BottomNav'
import { getUserType, setUserType, type UserType } from '../lib/storage'
import { useState } from 'react'

export function MePage() {
  const [type, setType] = useState<UserType>(() => getUserType())

  function choose(next: 'couple' | 'male') {
    setUserType(next)
    setType(next)
  }

  return (
    <div className="bg-atmosphere min-h-svh pb-24">
      <header className="border-b border-[var(--line)] px-5 py-5">
        <h1 className="font-display text-3xl text-[var(--cream)]">הפרופיל שלי</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">הגדרות בסיס · אב־טיפוס מקומי</p>
      </header>

      <main className="mx-auto max-w-lg space-y-8 px-5 py-8">
        <section>
          <h2 className="text-sm font-medium text-[var(--champagne)]">מי אתם?</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => choose('couple')}
              className={`py-4 text-sm transition ${
                type === 'couple'
                  ? 'bg-[var(--ember)] text-[var(--cream)]'
                  : 'border border-[var(--line)] text-[var(--muted)]'
              }`}
            >
              זוג
            </button>
            <button
              type="button"
              onClick={() => choose('male')}
              className={`py-4 text-sm transition ${
                type === 'male'
                  ? 'bg-[var(--ember)] text-[var(--cream)]'
                  : 'border border-[var(--line)] text-[var(--muted)]'
              }`}
            >
              גבר
            </button>
          </div>
        </section>

        <section className="space-y-3 border-t border-[var(--line)] pt-8 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="font-display text-xl text-[var(--cream)]">כללי הבית</h2>
          <p>הסכמה מפורשת לפני כל מפגש. בלי לחץ, בלי הסתרת סטטוס, בלי שיתוף תמונות ללא רשות.</p>
          <p>MMF כאן זה מרחב למבוגרים שמחפשים כימיה — לא תוכן פיראטי ולא פרופילים מתחת לגיל 18.</p>
        </section>

        <section className="border-t border-[var(--line)] pt-8">
          <p className="font-display text-2xl text-[var(--champagne)]">MMF</p>
          <p className="mt-2 text-xs text-[var(--muted)]">גרסת דמו · נתונים מקומיים בדפדפן</p>
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
