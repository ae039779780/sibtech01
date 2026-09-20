"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";
import { ensureCustomerWallets } from "@/lib/services/wallets";

function toSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  kycStatus: string;
  kycTier: number;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "CUSTOMER" | "ADMIN" | "COMPLIANCE",
    kycStatus: user.kycStatus,
    kycTier: user.kycTier,
  };
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }
  await setSessionCookie(toSession(user));
  await writeAudit({
    actorId: user.id,
    action: "auth.login",
    entityType: "User",
    entityId: user.id,
  });
  redirect(user.role === "CUSTOMER" ? "/app" : "/admin");
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || password.length < 8) {
    redirect("/register?error=invalid");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/register?error=exists");
  }
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "CUSTOMER",
      kycStatus: "UNSTARTED",
      kycTier: 0,
      country: "CA",
    },
  });
  await ensureCustomerWallets(user.id, user.name);
  await setSessionCookie(toSession(user));
  await writeAudit({
    actorId: user.id,
    action: "auth.register",
    entityType: "User",
    entityId: user.id,
  });
  redirect("/app/profile");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
