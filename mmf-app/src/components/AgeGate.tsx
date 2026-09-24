type Props = {
  onConfirm: () => void
}

export function AgeGate({ onConfirm }: Props) {
  return (
    <div className="bg-atmosphere flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-5xl text-[var(--champagne)]">MMF</p>
      <p className="mt-4 text-sm text-[var(--muted)]">18+ · משימות בלבד · לא היכרויות</p>
      <button
        type="button"
        onClick={onConfirm}
        className="mt-10 bg-[var(--ember)] px-10 py-3.5 text-sm font-semibold text-[var(--cream)]"
      >
        כניסה
      </button>
    </div>
  )
}
