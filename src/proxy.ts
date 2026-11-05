import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Renamed from middleware.ts in Next.js 16. Proxy runs on the Node.js
// runtime, but it stays database-free on purpose: Next.js documents that
// proxy should not rely on shared modules, and a query on every request
// just to guard a route is expensive. This only checks that the cookie
// carries a valid signature. Whether the session has been revoked is
// decided by getCurrentUser() on the page, which can read the database.

const PUBLIC_PATHS = ["/masuk", "/daftar"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!session && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    return NextResponse.redirect(url);
  }

  if (session && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
