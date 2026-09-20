import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  can,
  isStaffRole,
  parseAccountKind,
  parseRole,
  type AccountKind,
  type Capability,
  type Role,
} from "@/lib/auth/permissions";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  kycStatus: string;
  kycTier: number;
  cryptoFriendly: boolean;
  accountKind: AccountKind;
};

const COOKIE = "sibtech_session";

function secret() {
  const value = process.env.AUTH_SECRET ?? "local-demo-auth-secret-not-for-production";
  return new TextEncoder().encode(value);
}

export function toSessionUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  kycStatus: string;
  kycTier: number;
  cryptoFriendly?: boolean;
  accountKind?: string;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: parseRole(user.role),
    kycStatus: user.kycStatus,
    kycTier: user.kycTier,
    cryptoFriendly: Boolean(user.cryptoFriendly),
    accountKind: parseAccountKind(user.accountKind),
  };
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .setSubject(user.id)
    .sign(secret());
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return toSessionUser({
      id: String(payload.id ?? payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role),
      kycStatus: String(payload.kycStatus ?? "UNSTARTED"),
      kycTier: Number(payload.kycTier ?? 0),
      cryptoFriendly: Boolean(payload.cryptoFriendly),
      accountKind: String(payload.accountKind ?? "PERSONAL"),
    });
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

export async function requireStaff(): Promise<SessionUser> {
  const session = await requireSession();
  if (!isStaffRole(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

/** Admin-only. Freeze, settle, and partner switch use requireCapability instead when mixed. */
export async function requireAdmin(): Promise<SessionUser> {
  return requireCapability("settings.rails");
}

export async function requireCapability(capability: Capability): Promise<SessionUser> {
  const session = await requireStaff();
  if (!can(session.role, capability)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export const SESSION_COOKIE = COOKIE;
