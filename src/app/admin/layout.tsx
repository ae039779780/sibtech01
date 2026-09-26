import type { ReactNode } from "react";
import { AppShell } from "@/components/shells";
import { requireStaff } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireStaff();
  return <AppShell user={user}>{children}</AppShell>;
}
