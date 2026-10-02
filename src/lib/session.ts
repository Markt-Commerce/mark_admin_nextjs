import "server-only";

import { cookies } from "next/headers";

/**
 * The staff member's bearer token lives only in this httpOnly cookie on the
 * admin domain. Browser code never sees it; the Next.js server attaches it
 * to calls to the Flask API (backend-for-frontend).
 */
const COOKIE = "markt_admin_session";

/** Matches the backend token lifetime (TOKEN_MAX_AGE_SECONDS, 30 days). */
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

export async function setSessionToken(token: string): Promise<void> {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionToken(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export const SESSION_COOKIE = COOKIE;
