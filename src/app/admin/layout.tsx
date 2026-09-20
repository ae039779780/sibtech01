import type { ReactNode } from "react";
import { AppShell, adminNav } from "@/components/shells";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return (
    <AppShell user={user} items={adminNav} brand="Admin">
      {children}
    </AppShell>
  );
}
