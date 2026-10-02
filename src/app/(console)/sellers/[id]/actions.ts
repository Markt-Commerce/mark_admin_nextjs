"use server";

import type { ApiResult } from "@/lib/api/errors";
import type { AdminSellerDetail, MarketStatus } from "@/lib/api/types";
import { adminMutate } from "@/lib/dal";

/**
 * Seller actions: one admin endpoint each, returning the API's fresh
 * seller detail for the page to re-render from.
 */

const path = (id: number, action = "") => `/admin/sellers/${id}${action}`;

export async function verifySeller(id: number, note?: string): Promise<ApiResult<AdminSellerDetail>> {
  return adminMutate(path(id, "/verify"), { method: "POST", body: note ? { note } : {} });
}

export async function rejectSeller(id: number, reason: string): Promise<ApiResult<AdminSellerDetail>> {
  return adminMutate(path(id, "/reject"), { method: "POST", body: { reason } });
}

type ReasonAction = "suspend" | "unsuspend" | "feature" | "unfeature";

export async function sellerReasonAction(
  id: number,
  action: ReasonAction,
  reason?: string,
): Promise<ApiResult<AdminSellerDetail>> {
  return adminMutate(path(id, `/${action}`), { method: "POST", body: reason ? { reason } : {} });
}

export async function reviewMarket(
  id: number,
  status: MarketStatus,
  reason?: string,
): Promise<ApiResult<AdminSellerDetail>> {
  return adminMutate(path(id, "/market-verification"), {
    method: "POST",
    body: reason ? { status, reason } : { status },
  });
}

export async function editPayout(
  id: number,
  changes: { payout_bank_code?: string; payout_account_number?: string; payout_account_name?: string },
): Promise<ApiResult<AdminSellerDetail>> {
  return adminMutate(path(id, "/payout"), { method: "PATCH", body: changes });
}
