import type { AdminMe, Permission } from "./api/types";

/**
 * Whether the signed-in staff member holds a permission. Every menu item and
 * action button is gated through this, never through the role name: the
 * backend's permission matrix is the single source of truth and /admin/me
 * already resolves it.
 */
export function can(me: Pick<AdminMe, "permissions"> | null | undefined, permission: Permission): boolean {
  return !!me && me.permissions.includes(permission);
}

export function canAny(me: Pick<AdminMe, "permissions"> | null | undefined, permissions: Permission[]): boolean {
  return permissions.some((p) => can(me, p));
}

/**
 * Whether the operator may act on this account at all. The backend refuses
 * suspend and ban on your own account, and on any admin account unless you
 * are a super admin. The console applies the same rule to every account
 * action so operators are never shown a button that should not work.
 */
export function canActOnAccount(
  me: Pick<AdminMe, "user_id" | "is_super_admin">,
  target: { id: string; is_admin: boolean; admin_role: string | null },
): { allowed: true } | { allowed: false; reason: string } {
  if (me.user_id === target.id) {
    return { allowed: false, reason: "You can't take account actions on your own account." };
  }
  if ((target.is_admin || target.admin_role) && !me.is_super_admin) {
    return { allowed: false, reason: "Only a super admin can take action on a staff account." };
  }
  return { allowed: true };
}
