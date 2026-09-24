type Props = {
  onConfirm: () => void
}

export function AgeGate({ onConfirm }: Props) {
  return (
    <div className="bg-atmosphere noise-overlay relative flex min-h-svh items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="animate-drift h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(12,9,8,0.55)] via-[rgba(12,9,8,0.75)] to-[var(--ink)]" />
      </div>

      <div className="relative z-10 max-w-md text-center">
        <p className="animate-fade-up font-display text-5xl tracking-tight text-[var(--champagne)] sm:text-6xl">
          MMF
        </p>
        <h1 className="animate-fade-up-delay mt-6 font-display text-2xl leading-snug text-[var(--cream)] sm:text-3xl">
          משימות נועזות · 3 שחקנים
        </h1>
        <p className="animate-fade-up-delay-2 mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          לא היכרויות. משחק משימות למבוגרים בלבד — בהסכמה, עם גבולות, בלי לבלבל.
        </p>

        <div className="animate-fade-up-delay-2 mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onConfirm}
            className="bg-[var(--ember)] px-8 py-3.5 text-sm font-semibold tracking-wide text-[var(--cream)] transition hover:bg-[var(--ember-hot)]"
          >
            אני מעל גיל 18 — כניסה
          </button>
          <a
            href="https://www.google.com"
            className="border border-[var(--line)] px-8 py-3.5 text-sm text-[var(--muted)] transition hover:border-[var(--champagne)]/40 hover:text-[var(--cream)]"
          >
            יציאה
          </a>
        </div>
        <p className="mt-8 text-[11px] leading-relaxed text-[var(--muted)]/80">
          בלחיצה על כניסה אתם מאשרים שאתם בני 18 ומעלה ושכל המשתתפים מסכימים.
        </p>
      </div>
    </div>
  )
}
