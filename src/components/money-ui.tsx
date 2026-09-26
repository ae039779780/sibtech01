import { cn, currencyFlag, currencyPrefix, displayFigure } from "@/lib/format";
import type { ReactNode } from "react";

export function QuickAction({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a href={href} className="group flex w-[4.6rem] flex-col items-center gap-2">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-navy shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition group-hover:scale-[1.04]">
        {icon}
      </span>
      <span className="text-center text-[11px] font-medium leading-tight text-ink">{label}</span>
    </a>
  );
}

export function AccountRow({
  code,
  name,
  minor,
  href,
}: {
  code: string;
  name: string;
  minor: bigint | string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-navy-lift text-lg">
        {currencyFlag(code)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{name}</span>
        <span className="text-xs text-muted">{code}</span>
      </span>
      <span className="font-medium tabular-nums">
        {currencyPrefix(code)}
        {displayFigure(minor, code)}
      </span>
    </>
  );
  const cls = "flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-white/5";
  if (href) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function TxRow({
  title,
  subtitle,
  amount,
  currency,
  inbound,
}: {
  title: string;
  subtitle: string;
  amount: bigint | string;
  currency: string;
  inbound: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className={cn(
          "grid h-11 w-11 place-items-center rounded-full text-sm font-semibold",
          inbound ? "bg-ok/15 text-ok" : "bg-white/8 text-ink",
        )}
      >
        {inbound ? "↓" : "↑"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
      <p className={cn("tabular-nums text-sm font-medium", inbound && "text-ok")}>
        {inbound ? "+" : "−"}
        {currencyPrefix(currency)}
        {displayFigure(amount, currency)}
      </p>
    </div>
  );
}

export function MetalCard({
  last4,
  brand,
  kind,
  spendFrom,
}: {
  last4: string;
  brand: string;
  kind: string;
  spendFrom: string;
}) {
  return (
    <div className="relative aspect-[1.58/1] w-full max-w-sm overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#12324f] via-[#0c6b75] to-[#ff7a4a] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute bottom-0 left-1/3 h-24 w-48 rounded-full bg-coral/30 blur-2xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between text-[11px] uppercase tracking-[0.22em] text-white/80">
          <span>Sibtech {kind.toLowerCase()}</span>
          <span>{brand}</span>
        </div>
        <p className="font-mono text-xl tracking-[0.28em]">•••• {last4}</p>
        <div className="flex items-end justify-between text-xs text-white/85">
          <span>Spend {spendFrom}</span>
          <span>Crypto on</span>
        </div>
      </div>
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-teal to-coral text-xs font-semibold text-navy">
      {initials}
    </span>
  );
}

export function SectionLabel({ children, href }: { children: ReactNode; href?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
      {href ? (
        <a href={href} className="text-sm text-teal">
          See all
        </a>
      ) : null}
    </div>
  );
}
