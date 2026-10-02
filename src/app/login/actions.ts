"use server";

import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api/server";
import type { AdminLoginResponse } from "@/lib/api/types";
import { clearSessionToken, getSessionToken, setSessionToken } from "@/lib/session";

export interface LoginState {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
  email?: string;
}

/** Only same-site paths, so `next` can't send anyone off to another site. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: LoginState["fieldErrors"] = {};
  if (!email) fieldErrors.email = "Enter your email address.";
  if (!password) fieldErrors.password = "Enter your password.";
  if (fieldErrors.email || fieldErrors.password) return { fieldErrors, email };

  const result = await apiRequest<AdminLoginResponse>("/admin/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (!result.ok) {
    const { status, message, fieldErrors: api } = result.error;
    if (api?.email) return { fieldErrors: { email: "Enter a valid email address." }, email };
    if (status === 401 && message === "Invalid credentials") {
      return { error: "That email and password don't match a staff account. Check them and try again.", email };
    }
    if (status === 429) {
      return { error: "Too many sign-in attempts from this network. Wait a minute and try again.", email };
    }
    return { error: message, email };
  }

  await setSessionToken(result.data.access_token);
  redirect(safeNext(formData.get("next")));
}

/**
 * Sign out: revoke the token on the API (every session this account
 * holds), then drop the cookie. The cookie is cleared even if the API call
 * fails, so the browser is always signed out.
 */
export async function logout(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    await apiRequest("/admin/auth/logout", { method: "POST", token });
  }
  await clearSessionToken();
  redirect("/login?reason=signed-out");
}
