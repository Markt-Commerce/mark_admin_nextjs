"use server";

import type { ApiResult } from "@/lib/api/errors";
import type { AdminUserDetail, ResendVerificationResponse } from "@/lib/api/types";
import { LIMITS } from "@/lib/api/types";
import { adminMutate } from "@/lib/dal";

/**
 * User actions. Each one calls exactly one admin endpoint and returns the
 * API's response untouched, so the page re-renders from the server's view
 * of the user. Permission checks happen on the API; the UI only hides
 * buttons the operator can't use.
 */

const path = (id: string, action = "") => `/admin/users/${encodeURIComponent(id)}${action}`;

type ReasonAction = "suspend" | "reinstate" | "ban" | "unban" | "force-logout";

export async function userReasonAction(
  id: string,
  action: ReasonAction,
  reason?: string,
): Promise<ApiResult<AdminUserDetail>> {
  return adminMutate<AdminUserDetail>(path(id, `/${action}`), {
    method: "POST",
    body: reason ? { reason: reason.slice(0, LIMITS.reason) } : {},
  });
}

export async function verifyEmail(id: string): Promise<ApiResult<AdminUserDetail>> {
  return adminMutate<AdminUserDetail>(path(id, "/verify-email"), { method: "POST" });
}

export async function resendVerification(id: string): Promise<ApiResult<ResendVerificationResponse>> {
  return adminMutate<ResendVerificationResponse>(path(id, "/resend-verification"), { method: "POST" });
}

export async function editProfile(
  id: string,
  changes: { username?: string; phone_number?: string },
): Promise<ApiResult<AdminUserDetail>> {
  return adminMutate<AdminUserDetail>(path(id), { method: "PATCH", body: changes });
}

export async function uploadProfilePicture(id: string, formData: FormData): Promise<ApiResult<AdminUserDetail>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: { status: 400, message: "Choose an image to upload." } };
  }
  const body = new FormData();
  body.set("file", file, file.name);
  return adminMutate<AdminUserDetail>(path(id, "/profile-picture"), { method: "POST", body });
}

export async function setRoles(
  id: string,
  roles: { is_buyer?: boolean; is_seller?: boolean },
): Promise<ApiResult<AdminUserDetail>> {
  return adminMutate<AdminUserDetail>(path(id, "/roles"), { method: "POST", body: roles });
}
