import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import type { ApiResult } from "./api/errors";
import { apiRequest, type RequestOptions } from "./api/server";
import type { AdminMe } from "./api/types";
import { clearSessionToken, getSessionToken } from "./session";

/**
 * Data access layer: every authenticated call to the Flask API goes
 * through here, so the session check sits next to the data.
 *
 * A 401 always means the session is over (expired, signed out elsewhere,
 * suspended or banned). The login page clears the cookie when it receives
 * reason=expired (see proxy.ts), since cookies can't be changed while a
 * Server Component renders.
 */
export const EXPIRED_URL = "/login?reason=expired";

export const getMe = cache(async (): Promise<AdminMe> => {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  const result = await apiRequest<AdminMe>("/admin/me", { token });
  if (!result.ok) {
    if (result.error.status === 401) redirect(EXPIRED_URL);
    if (result.error.status === 403) redirect("/no-access");
    throw new Error(result.error.message);
  }
  return result.data;
});

/** Authenticated GET for Server Components. Ends the session on 401. */
export async function adminGet<T>(path: string, query?: RequestOptions["query"]): Promise<ApiResult<T>> {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  const result = await apiRequest<T>(path, { token, query });
  if (!result.ok && result.error.status === 401) redirect(EXPIRED_URL);
  return result;
}

/**
 * Authenticated mutation for Server Actions. On 401 the cookie is cleared
 * here (allowed in an action) before sending the operator to sign in.
 */
export async function adminMutate<T>(
  path: string,
  options: Omit<RequestOptions, "token"> & { method: "POST" | "PATCH" },
): Promise<ApiResult<T>> {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  const result = await apiRequest<T>(path, { ...options, token });
  if (!result.ok && result.error.status === 401) {
    await clearSessionToken();
    redirect(EXPIRED_URL);
  }
  return result;
}
