import type { MarketStatus, SellerVerificationStatus, UserStatus } from "./api/types";

/**
 * Status vocabulary: one label and tone per backend value. Pills read these
 * and never colour by hand, so a status always looks the same everywhere.
 *
 * - User status: suspended and banned are both reversible holds but must
 *   look clearly different (warning vs danger); deactivated is the user's
 *   own choice (neutral); deleted is final (muted).
 * - Seller verification and market verification are separate axes and use
 *   visibly different pill styles (see StatusPill `variant`).
 */
export type Tone = "success" | "warning" | "danger" | "info" | "attention" | "neutral" | "muted" | "brand";

interface StatusMeta {
  label: string;
  tone: Tone;
  description: string;
}

export const USER_STATUS: Record<UserStatus, StatusMeta> = {
  active: { label: "Active", tone: "success", description: "Can sign in and use Markt." },
  suspended: { label: "Suspended", tone: "warning", description: "Temporarily blocked from signing in by staff." },
  banned: { label: "Banned", tone: "danger", description: "Removed from Markt by staff. Cannot sign in." },
  deactivated: { label: "Deactivated", tone: "neutral", description: "The user deactivated their own account." },
  deleted: { label: "Deleted", tone: "muted", description: "The user deleted their account. This is permanent." },
};

export const SELLER_VERIFICATION: Record<SellerVerificationStatus, StatusMeta> = {
  unverified: { label: "Unverified", tone: "neutral", description: "Has not applied for verification." },
  pending: { label: "Pending review", tone: "info", description: "Waiting for a reviewer." },
  verified: { label: "Verified", tone: "success", description: "Identity and business checks passed." },
  rejected: { label: "Rejected", tone: "danger", description: "Verification was refused." },
  suspended: { label: "Verification suspended", tone: "warning", description: "Verification standing is on hold." },
};

export const MARKET_STATUS: Record<MarketStatus, StatusMeta> = {
  unverified: { label: "Market unverified", tone: "neutral", description: "No market claim checked yet." },
  verified: { label: "Market verified", tone: "success", description: "Shop location matches its market." },
  flagged: { label: "Market flagged", tone: "attention", description: "Shop location doesn't match its market. Needs review." },
};

export const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super admin",
  support: "Support",
  moderation: "Moderation",
  finance: "Finance",
  catalog: "Catalog",
  logistics: "Logistics",
};

/** A role string the backend doesn't recognise grants nothing; show it raw. */
export function roleLabel(role: string | null | undefined): string | null {
  if (!role) return null;
  return ROLE_LABEL[role] ?? role;
}
