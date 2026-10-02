import { type NextRequest, NextResponse } from "next/server";

/**
 * Optimistic routing only (reads the cookie, never calls the API). The real
 * check happens in the data access layer on every request for data.
 *
 * - No session cookie on a console page: go to /login, remembering the page.
 * - /login?reason=expired: the API rejected the token, so drop the cookie.
 * - Session cookie on /login otherwise: go to the console.
 */
const COOKIE = "markt_admin_session";
const PUBLIC = ["/login", "/design-system"];

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasSession = request.cookies.has(COOKIE);
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (pathname === "/login" && searchParams.get("reason") === "expired") {
    const response = NextResponse.next();
    response.cookies.delete(COOKIE);
    return response;
  }

  if (!isPublic && !hasSession) {
    const url = new URL("/login", request.url);
    const next = pathname + request.nextUrl.search;
    if (pathname !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|icon.svg|brand/).*)"],
};
