import { Logo } from "@/components/brand";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/format";
import type { SessionUser } from "@/lib/auth/session";
import type { ReactNode } from "react";

type Item = { href: string; label: string };

export function AppShell({
  user,
  items,
  brand,
  children,
}: {
  user: SessionUser;
  items: Item[];
  brand: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-line bg-navy-mid/70 p-5 md:block">
        <a href={brand === "Admin" ? "/admin" : "/app"} className="mb-8 block">
          <Logo />
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted">{brand}</p>
        </a>
        <nav className="space-y-1">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-xl px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 md:px-8">
          <div className="md:hidden">
            <Logo compact />
          </div>
          <div className="hidden text-sm text-muted md:block">
            {user.name} · {user.email}
          </div>
          <form action={logoutAction}>
            <button className="text-sm text-muted hover:text-ink" type="submit">
              Sign out
            </button>
          </form>
        </header>
        <div className="flex gap-2 overflow-x-auto border-b border-line px-4 py-2 md:hidden">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn("whitespace-nowrap rounded-full border border-line px-3 py-1 text-xs")}
            >
              {item.label}
            </a>
          ))}
        </div>
        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}

export const customerNav: Item[] = [
  { href: "/app", label: "Home" },
  { href: "/app/wallet", label: "Wallet" },
  { href: "/app/pay-in", label: "Add money" },
  { href: "/app/send", label: "Send" },
  { href: "/app/exchange", label: "Exchange" },
  { href: "/app/accounts", label: "Global account" },
  { href: "/app/cards", label: "Cards" },
  { href: "/app/currencies", label: "Currencies" },
  { href: "/app/fx", label: "FX & spread" },
  { href: "/app/activity", label: "Activity" },
  { href: "/app/profile", label: "Profile / KYC" },
];

export const adminNav: Item[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/kyc", label: "KYC / Cases" },
  { href: "/admin/transactions", label: "Transactions" },
  { href: "/admin/rails", label: "Pay-ins / Payouts" },
  { href: "/admin/fx", label: "FX controls" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin/settings", label: "Settings" },
];
