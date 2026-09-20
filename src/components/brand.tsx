export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal text-navy">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path
            d="M4 14c4-8 12-8 16 0"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="10" r="2.2" fill="currentColor" />
        </svg>
      </span>
      {compact ? null : (
        <span className="text-sm font-semibold tracking-wide">Sibtech</span>
      )}
    </span>
  );
}

export function LicenseBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[11px] text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
      Canadian financial license · operate globally via partners
    </span>
  );
}
