import type { ReactNode } from "react";
import { AppShell } from "@/components/shells";
import { requireSession } from "@/lib/auth/session";

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const user = await requireSession();
  return <AppShell user={user}>{children}</AppShell>;
}
