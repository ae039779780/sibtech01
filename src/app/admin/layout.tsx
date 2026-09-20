import type { ReactNode } from "react";
import { AppShell, staffNavFor } from "@/components/shells";
import { roleLabel } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireStaff();
  return (
    <AppShell user={user} items={staffNavFor(user.role)} brand={roleLabel(user.role)}>
      {children}
    </AppShell>
  );
}
