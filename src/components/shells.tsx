"use client";

import { Logo } from "@/components/brand";
import { logoutAction } from "@/app/actions/auth";
import { Avatar } from "@/components/money-ui";
import { cn } from "@/lib/format";
import { roleLabel } from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";
import {
  Activity,
  ArrowUpRight,
  Bitcoin,
  CreditCard,
  Globe,
  Home,
  Landmark,
  LayoutDashboard,
  Repeat,
  Settings,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Item = { href: string; label: string; icon: ReactNode };

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const retail = user.role === "CUSTOMER";
  const items = retail ? customerNavFor(user) : staffNavFor(user.role);
  const brand = retail ? "Retail" : roleLabel(user.role);
  const home = retail ? "/app" : "/admin";
  const mobile = items.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-[88px] shrink-0 flex-col items-center border-r border-line bg-black/20 py-5 lg:flex xl:w-60 xl:items-stretch xl:px-4">
        <a href={home} className="mb-8 flex justify-center xl:justify-start">
          <span className="xl:hidden">
            <Logo compact wordmark={false} />
          </span>
          <span className="hidden xl:block">
            <Logo />
          </span>
        </a>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const active =
              pathname === item.href || (item.href !== home && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                  active ? "bg-white/10 text-ink" : "text-muted hover:bg-white/5 hover:text-ink",
                  "justify-center xl:justify-start",
                )}
              >
                <span className="[&>svg]:h-[1.15rem] [&>svg]:w-[1.15rem]">{item.icon}</span>
                <span className="hidden xl:inline">{item.label}</span>
              </a>
            );
          })}
        </nav>
        <p className="mt-auto hidden px-3 text-[10px] uppercase tracking-[0.16em] text-muted xl:block">
          Demo-complete · not a live bank
        </p>
        <form action={logoutAction} className="mt-4 hidden xl:block">
          <button className="w-full rounded-2xl px-3 py-2 text-left text-sm text-muted hover:text-ink" type="submit">
            Sign out
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-4 pb-1 pt-4 md:px-8">
          <div className="flex items-center gap-3">
            <span className="lg:hidden">
              <Logo compact />
            </span>
            <p className="hidden text-sm text-muted md:block">{brand}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm md:block">
              <p className="font-medium text-ink">{user.name}</p>
              <p className="text-xs text-muted">
                {roleLabel(user.role)}
                {user.role === "CUSTOMER" && user.cryptoFriendly ? " · crypto" : ""}
                {" · "}
                {user.email}
              </p>
            </div>
            <Avatar name={user.name} />
          </div>
        </header>
        <main className="flex-1 px-4 pb-28 pt-4 md:px-8 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-[#071422]/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {mobile.map((item) => {
            const active =
              pathname === item.href || (item.href !== home && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-[3.5rem] flex-col items-center gap-1 rounded-2xl px-2 py-1 text-[10px]",
                  active ? "text-ink" : "text-muted",
                )}
              >
                <span className={cn("grid h-8 w-8 place-items-center rounded-full", active && "bg-white/10")}>
                  {item.icon}
                </span>
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

const retailBase: Item[] = [
  { href: "/app", label: "Home", icon: <Home className="h-5 w-5" /> },
  { href: "/app/wallet", label: "Accounts", icon: <Wallet className="h-5 w-5" /> },
  { href: "/app/send", label: "Payments", icon: <ArrowUpRight className="h-5 w-5" /> },
  { href: "/app/cards", label: "Cards", icon: <CreditCard className="h-5 w-5" /> },
  { href: "/app/profile", label: "Profile", icon: <Users className="h-5 w-5" /> },
  { href: "/app/pay-in", label: "Add money", icon: <Landmark className="h-5 w-5" /> },
  { href: "/app/exchange", label: "Exchange", icon: <Repeat className="h-5 w-5" /> },
  { href: "/app/accounts", label: "IBAN", icon: <Globe className="h-5 w-5" /> },
  { href: "/app/currencies", label: "Markets", icon: <Activity className="h-5 w-5" /> },
  { href: "/app/fx", label: "FX", icon: <Repeat className="h-5 w-5" /> },
  { href: "/app/activity", label: "Activity", icon: <Activity className="h-5 w-5" /> },
  { href: "/architecture", label: "Architecture", icon: <LayoutDashboard className="h-5 w-5" /> },
];

export function customerNavFor(user: SessionUser): Item[] {
  if (!user.cryptoFriendly) return retailBase;
  const items = [...retailBase];
  items.splice(4, 0, {
    href: "/app/crypto",
    label: "Crypto",
    icon: <Bitcoin className="h-5 w-5" />,
  });
  return items;
}

const staffAll: Item[] = [
  { href: "/admin", label: "Home", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="h-5 w-5" /> },
  { href: "/admin/kyc", label: "KYC", icon: <Shield className="h-5 w-5" /> },
  { href: "/admin/transactions", label: "Ledger", icon: <Activity className="h-5 w-5" /> },
  { href: "/admin/rails", label: "Rails", icon: <ArrowUpRight className="h-5 w-5" /> },
  { href: "/admin/fx", label: "FX", icon: <Repeat className="h-5 w-5" /> },
  { href: "/admin/audit", label: "Audit", icon: <Shield className="h-5 w-5" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  { href: "/architecture", label: "Architecture", icon: <Globe className="h-5 w-5" /> },
];

export function staffNavFor(role: SessionUser["role"]): Item[] {
  if (role === "ADMIN") return staffAll;
  if (role === "COMPLIANCE") {
    return staffAll.filter((item) =>
      ["/admin", "/admin/users", "/admin/kyc", "/admin/audit", "/architecture"].includes(item.href),
    );
  }
  return staffAll.filter((item) =>
    [
      "/admin",
      "/admin/users",
      "/admin/transactions",
      "/admin/rails",
      "/admin/audit",
      "/architecture",
    ].includes(item.href),
  );
}

/** @deprecated use customerNavFor(session) */
export const customerNav = retailBase;
/** @deprecated use staffNavFor(role) */
export const adminNav = staffAll;
