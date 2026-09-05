import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

// Next.js 16 a renommé middleware.ts en proxy.ts (fonctionnalité identique).
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/login" || pathname.startsWith("/api/auth/login");

  if (!session && !isLoginRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/patrimoine", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
