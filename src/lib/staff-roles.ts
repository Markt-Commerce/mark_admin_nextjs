import type { AdminRole, Permission } from "./api/types";

/**
 * What each staff role can do, for choosing a role. A copy of ROLE_PERMISSIONS
 * in markt_python/app/admin/permissions.py: change both together. Only the
 * role picker reads it. Gating still uses the operator's own permissions
 * from /admin/me.
 */
const ROLE_PERMISSIONS: Record<Exclude<AdminRole, "super_admin">, Permission[]> = {
  support: ["user.view", "user.edit", "user.verify_email", "user.force_logout", "seller.view"],
  moderation: ["user.view", "user.suspend", "user.ban", "seller.view", "seller.suspend"],
  finance: ["user.view", "seller.view", "seller.edit_payout"],
  catalog: ["user.view", "seller.view", "seller.verify", "seller.suspend", "seller.feature", "seller.market_review"],
  logistics: ["user.view", "seller.view", "seller.market_review"],
};

/** super_admin holds every permission, as on the backend. */
export function roleCan(role: AdminRole, permission: Permission): boolean {
  return role === "super_admin" || ROLE_PERMISSIONS[role].includes(permission);
}

/** One plain sentence per role, shown under the role picker. */
export const ROLE_SUMMARY: Record<AdminRole, string> = {
  super_admin: "Can do everything, including giving other people staff roles.",
  support: "Looks after customer accounts: profile details, email checks and sign-outs.",
  moderation: "Suspends and bans users, and suspends shops.",
  finance: "Changes seller payout details.",
  catalog: "Verifies, features and suspends shops, and reviews shop markets.",
  logistics: "Reviews which market a shop belongs to.",
};

/** The comparison grid's rows: one per permission, grouped by area. */
export const CAPABILITIES: Array<{ group: string; label: string; permission: Permission }> = [
  { group: "Users", label: "See users", permission: "user.view" },
  { group: "Users", label: "Fix profile details", permission: "user.edit" },
  { group: "Users", label: "Mark emails as verified", permission: "user.verify_email" },
  { group: "Users", label: "Sign users out everywhere", permission: "user.force_logout" },
  { group: "Users", label: "Suspend users", permission: "user.suspend" },
  { group: "Users", label: "Ban users", permission: "user.ban" },
  { group: "Users", label: "Turn buyer and seller roles on or off", permission: "user.manage_roles" },
  { group: "Shops", label: "See shops", permission: "seller.view" },
  { group: "Shops", label: "Verify sellers", permission: "seller.verify" },
  { group: "Shops", label: "Suspend shops", permission: "seller.suspend" },
  { group: "Shops", label: "Feature shops", permission: "seller.feature" },
  { group: "Shops", label: "Review shop markets", permission: "seller.market_review" },
  { group: "Shops", label: "Change payout details", permission: "seller.edit_payout" },
  { group: "Staff", label: "Give and remove staff roles", permission: "user.manage_staff" },
];
