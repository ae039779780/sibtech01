import type { ReactNode } from "react";
import { AppShell, customerNav } from "@/components/shells";
import { requireSession } from "@/lib/auth/session";

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const user = await requireSession();
  return (
    <AppShell user={user} items={customerNav} brand="Customer">
      {children}
    </AppShell>
  );
}
