import type { ReactNode } from "react";
import { AppShell, customerNavFor } from "@/components/shells";
import { requireSession } from "@/lib/auth/session";

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const user = await requireSession();
  return (
    <AppShell user={user} items={customerNavFor(user)} brand="Retail">
      {children}
    </AppShell>
  );
}
