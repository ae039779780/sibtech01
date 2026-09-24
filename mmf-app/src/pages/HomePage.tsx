import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="bg-atmosphere flex min-h-svh flex-col px-6 py-8">
      <p className="font-display text-2xl text-[var(--champagne)]">MMF</p>
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-display text-4xl text-[var(--cream)]">משימות</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          לא היכרויות · 3 שחקנים · טיימר ומילה בטוחה
        </p>
        <Link
          to="/setup"
          className="mt-10 inline-block w-fit bg-[var(--ember)] px-8 py-3.5 text-sm font-semibold text-[var(--cream)]"
        >
          לשלוף משימה
        </Link>
      </div>
    </div>
  )
}
