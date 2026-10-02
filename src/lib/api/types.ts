/**
 * Types for the Markt admin API (`/api/v1/admin`). These mirror
 * `markt_python/app/admin/schemas.py` field for field; when the backend
 * schema changes, change it here and nowhere else.
 */

export const PERMISSIONS = [
  "user.view",
  "user.edit",
  "user.suspend",
  "user.ban",
  "user.verify_email",
  "user.force_logout",
  "user.manage_roles",
  "seller.view",
  "seller.verify",
  "seller.suspend",
  "seller.market_review",
  "seller.edit_payout",
  "seller.feature",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ADMIN_ROLES = [
  "super_admin",
  "support",
  "moderation",
  "finance",
  "catalog",
  "logistics",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

/** GET /admin/me */
export interface AdminMe {
  user_id: string;
  email: string;
  is_admin: boolean;
  is_super_admin: boolean;
  /** Free string in the DB; an unrecognised value grants nothing. */
  admin_role: string | null;
  permissions: string[];
}

/** POST /admin/auth/login */
export interface AdminLoginResponse extends AdminMe {
  access_token: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  per_page: number;
  total_items: number;
  /** 0 when there are no results. */
  total_pages: number;
}

// --- Users ---------------------------------------------------------------

export const USER_STATUSES = [
  "active",
  "suspended",
  "banned",
  "deactivated",
  "deleted",
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_ROLE_FILTERS = ["buyer", "seller", "admin", "staff"] as const;
export type UserRoleFilter = (typeof USER_ROLE_FILTERS)[number];

export interface AdminUserListItem {
  id: string;
  email: string;
  username: string | null;
  phone_number: string | null;
  /** May be a non-URL placeholder such as "default.jpg". */
  profile_picture: string | null;
  is_buyer: boolean;
  is_seller: boolean;
  is_admin: boolean;
  admin_role: string | null;
  email_verified: boolean;
  status: UserStatus;
  created_at: string | null;
  last_login_at: string | null;
}

export interface AdminBuyerSub {
  id: number;
  buyername: string | null;
  is_active: boolean;
  refund_preference: string | null;
}

export interface AdminSellerSub {
  id: number;
  shop_name: string | null;
  shop_slug: string | null;
  is_active: boolean;
  verification_status: SellerVerificationStatus | null;
  market_verification_status: MarketStatus | null;
}

export interface AdminUserDetail extends AdminUserListItem {
  is_active: boolean;
  suspension_reason: string | null;
  ban_reason: string | null;
  suspended_at: string | null;
  banned_at: string | null;
  deactivated_at: string | null;
  deleted_at: string | null;
  buyer: AdminBuyerSub | null;
  seller: AdminSellerSub | null;
}

/** POST /admin/users/<id>/resend-verification */
export interface ResendVerificationResponse {
  sent: boolean;
  email: string;
}

// --- Sellers -------------------------------------------------------------

export const SELLER_VERIFICATION_STATUSES = [
  "unverified",
  "pending",
  "verified",
  "rejected",
  "suspended",
] as const;
export type SellerVerificationStatus =
  (typeof SELLER_VERIFICATION_STATUSES)[number];

export const MARKET_STATUSES = ["unverified", "verified", "flagged"] as const;
export type MarketStatus = (typeof MARKET_STATUSES)[number];

export interface AdminSellerListItem {
  id: number;
  user_id: string | null;
  shop_name: string | null;
  shop_slug: string | null;
  is_active: boolean;
  is_featured: boolean;
  verification_status: SellerVerificationStatus | null;
  market_verification_status: MarketStatus | null;
  email: string | null;
  username: string | null;
  total_rating: number | null;
  total_raters: number | null;
  created_at: string | null;
}

export interface AdminSellerPayout {
  bank_code: string | null;
  account_number: string | null;
  account_name: string | null;
  paystack_subaccount_code: string | null;
}

export interface AdminSellerMarket {
  market_id: number | null;
  /** Free JSON. Known shapes: {formatted, city, state} or legacy {street}. */
  shop_address: unknown;
  shop_latitude: number | null;
  shop_longitude: number | null;
}

export interface AdminSellerDetail extends AdminSellerListItem {
  description: string | null;
  banner_url: string | null;
  /** Free JSON, e.g. {returns, shipping}. */
  policies: unknown;
  verification_note: string | null;
  payout: AdminSellerPayout | null;
  market: AdminSellerMarket | null;
}

// --- Request limits (from the marshmallow validators) ---------------------

export const LIMITS = {
  reason: 255,
  rejectReason: 500,
  verifyNote: 500,
  phoneNumber: 20,
  usernameMin: 1,
  usernameMax: 50,
  payoutBankCode: 10,
  payoutAccountNumber: 20,
  payoutAccountName: 100,
  imageMaxBytes: 10 * 1024 * 1024,
} as const;
