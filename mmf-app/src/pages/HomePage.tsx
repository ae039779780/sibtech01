import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="bg-atmosphere noise-overlay relative min-h-svh overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="animate-drift h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[rgba(12,9,8,0.94)] via-[rgba(12,9,8,0.72)] to-[rgba(12,9,8,0.35)]" />
      </div>

      <header className="relative z-10 px-6 py-5 sm:px-10">
        <span className="font-display text-2xl text-[var(--champagne)]">MMF</span>
      </header>

      <main className="relative z-10 flex min-h-[calc(100svh-5rem)] flex-col justify-end px-6 pb-16 sm:max-w-xl sm:justify-center sm:px-10 sm:pb-0">
        <p className="animate-fade-up text-xs tracking-[0.25em] text-[var(--ember-hot)]">למבוגרים · 18+ · 3 שחקנים</p>
        <h1 className="animate-fade-up-delay mt-4 font-display text-4xl leading-[1.15] text-[var(--cream)] sm:text-5xl">
          משימות נועזות
        </h1>
        <p className="animate-fade-up-delay-2 mt-5 max-w-sm text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          3 שחקנים. שולפים. מבצעים רק מה שכולם אמרו לו כן. בלי היכרויות ובלי סיבוכים.
        </p>

        <div className="animate-fade-up-delay-2 mt-10">
          <Link
            to="/setup"
            className="inline-block bg-[var(--ember)] px-8 py-3.5 text-sm font-semibold text-[var(--cream)] transition hover:bg-[var(--ember-hot)]"
          >
            התחלת ערב
          </Link>
        </div>
      </main>
    </div>
  )
}
