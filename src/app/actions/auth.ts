"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearSessionCookie,
  setSessionCookie,
  toSessionUser,
} from "@/lib/auth/session";
import { isStaffRole, parseAccountKind } from "@/lib/auth/permissions";
import { writeAudit } from "@/lib/audit";
import { ensureCustomerWallets } from "@/lib/services/wallets";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }
  await setSessionCookie(toSessionUser(user));
  await writeAudit({
    actorId: user.id,
    action: "auth.login",
    entityType: "User",
    entityId: user.id,
  });
  redirect(isStaffRole(user.role) ? "/admin" : "/app");
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const accountKind = parseAccountKind(formData.get("accountKind"));
  const cryptoFriendly = String(formData.get("cryptoFriendly") ?? "") === "on";
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
      accountKind,
      cryptoFriendly,
    },
  });
  await ensureCustomerWallets(user.id, user.name);
  await setSessionCookie(toSessionUser(user));
  await writeAudit({
    actorId: user.id,
    action: "auth.register",
    entityType: "User",
    entityId: user.id,
    payload: { accountKind, cryptoFriendly },
  });
  redirect("/app/profile");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
