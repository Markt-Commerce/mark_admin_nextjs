/* eslint-disable @next/next/no-img-element -- static brand SVG */
import { LogOut, Store, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/login/actions";
import { Badge } from "@/components/ui/badge";
import type { AdminMe } from "@/lib/api/types";
import { can } from "@/lib/permissions";
import { roleLabel } from "@/lib/status";
import { type NavItem, NavLinks } from "./nav-links";

/** Menu built from permissions, never from the role name. */
export function navItemsFor(me: AdminMe): NavItem[] {
  const items: NavItem[] = [];
  if (can(me, "seller.view")) items.push({ href: "/sellers", label: "Sellers", icon: <Store /> });
  if (can(me, "user.view")) items.push({ href: "/users", label: "Users", icon: <Users /> });
  return items;
}

export function AppShell({ me, children }: { me: AdminMe; children: ReactNode }) {
  const items = navItemsFor(me);
  const role = roleLabel(me.admin_role);

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 flex h-topbar items-center gap-4 border-b border-border bg-surface px-4 lg:px-6">
        <Link href="/" className="flex min-h-control shrink-0 items-center gap-3 rounded-md">
          <img src="/brand/markt-logo.svg" alt="Markt" className="h-7 w-auto" />
          <span className="hidden text-sm font-semibold text-fg-muted sm:inline">Staff console</span>
        </Link>

        <nav aria-label="Main" className="min-w-0 flex-1 lg:hidden">
          <NavLinks items={items} orientation="horizontal" />
        </nav>
        <div className="hidden flex-1 lg:block" />

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden flex-col items-end leading-tight md:flex">
            <span className="text-sm font-semibold text-fg">{me.email}</span>
            <span className="text-xs text-fg-muted">
              {me.is_super_admin ? "Full access" : role ? `${role} role` : "No role"}
            </span>
          </div>
          {me.is_super_admin ? (
            <Badge tone="brand" title="Holds every admin permission">
              Super admin
            </Badge>
          ) : (
            role && <Badge tone="info">{role}</Badge>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex min-h-control items-center gap-2 rounded-md px-3 text-sm font-semibold text-fg-muted hover:bg-surface-hover hover:text-fg"
            >
              <LogOut aria-hidden className="size-4" />
              <span className="sr-only sm:not-sr-only">Sign out</span>
            </button>
          </form>
        </div>
      </header>

      <div className="flex">
        <nav
          aria-label="Main"
          className="sticky top-topbar hidden h-[calc(100dvh-var(--spacing-topbar))] w-sidebar shrink-0 border-r border-border bg-surface px-3 py-5 lg:block"
        >
          <NavLinks items={items} orientation="vertical" />
        </nav>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 focus:outline-none lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[96rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
