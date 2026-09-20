import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "local-demo-auth-secret-not-for-production",
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let role: string | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret());
      role = String(payload.role ?? "");
    } catch {
      role = null;
    }
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);

  if (pathname.startsWith("/app") && !role) {
    return NextResponse.redirect(login);
  }
  if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "COMPLIANCE") {
    return NextResponse.redirect(role ? new URL("/app", request.url) : login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
