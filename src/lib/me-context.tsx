"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { AdminMe, Permission } from "./api/types";
import { can } from "./permissions";

const MeContext = createContext<AdminMe | null>(null);

/** Makes the /admin/me payload available to client components. */
export function MeProvider({ me, children }: { me: AdminMe; children: ReactNode }) {
  return <MeContext.Provider value={me}>{children}</MeContext.Provider>;
}

export function useMe(): AdminMe | null {
  return useContext(MeContext);
}

export function useCan(permission: Permission): boolean {
  return can(useContext(MeContext), permission);
}

/**
 * Renders children only when the signed-in staff member holds the
 * permission. Use for every action button: a button the operator can't use
 * is not rendered at all, rather than failing on click.
 */
export function Can({ permission, children }: { permission: Permission; children: ReactNode }) {
  return useCan(permission) ? <>{children}</> : null;
}
