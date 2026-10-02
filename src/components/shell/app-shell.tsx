/* eslint-disable @next/next/no-img-element -- static brand SVG */
import { LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/login/actions";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { AdminMe } from "@/lib/api/types";
import { can } from "@/lib/permissions";
import { roleLabel } from "@/lib/status";
import { type NavItem, NavLinks } from "./nav-links";

/** Menu built from permissions, never from the role name. */
export function navItemsFor(me: AdminMe): NavItem[] {
  const items: NavItem[] = [];
  if (can(me, "seller.view")) items.push({ href: "/sellers", label: "Sellers" });
  if (can(me, "user.view")) items.push({ href: "/users", label: "Users" });
  return items;
}

/** The authority the operator is acting with: role and Super admin badge. */
function Authority({ me }: { me: AdminMe }) {
  const role = roleLabel(me.admin_role);
  return me.is_super_admin ? (
    <Badge tone="brand" title="Holds every admin permission">
      Super admin
    </Badge>
  ) : role ? (
    <Badge tone="info">{role}</Badge>
  ) : (
    <Badge tone="muted">No role</Badge>
  );
}

function SignOutButton({ compact }: { compact?: boolean }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex min-h-control w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-fg hover:bg-surface-hover/70"
      >
        <LogOut aria-hidden className="size-4 text-fg-muted" />
        <span className={compact ? "sr-only sm:not-sr-only" : undefined}>Sign out</span>
      </button>
    </form>
  );
}

/**
 * Console frame after reference A: a white sidebar card (organisation at the
 * top, section label, text-only menu, your account at the bottom) beside the
 * page. Below 1024px the menu moves into a top bar.
 */
export function AppShell({ me, children }: { me: AdminMe; children: ReactNode }) {
  const items = navItemsFor(me);

  return (
    <div className="min-h-dvh lg:flex lg:gap-3 lg:p-3">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Narrow screens: compact top bar. */}
      <header className="sticky top-0 z-30 flex h-topbar items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
        <Link href="/" className="flex min-h-control shrink-0 items-center">
          <img src="/brand/markt-logo.svg" alt="Markt" className="h-7 w-auto" />
        </Link>
        <nav aria-label="Main" className="min-w-0 flex-1">
          <NavLinks items={items} orientation="horizontal" />
        </nav>
        <Authority me={me} />
        <SignOutButton compact />
      </header>

      {/* Wide screens: sidebar card. */}
      <aside className="sticky top-3 hidden h-[calc(100dvh-1.5rem)] w-sidebar shrink-0 flex-col rounded-xl border border-border bg-surface shadow-card lg:flex">
        <Link href="/" className="flex min-h-control items-center gap-3 px-4 pt-5 pb-4">
          <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-brand-subtle">
            <img src="/brand/markt-mark.svg" alt="" className="h-5 w-auto" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-fg">Markt</span>
            <span className="text-xs text-fg-muted">Staff console</span>
          </span>
        </Link>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pt-2">
          <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-fg-muted uppercase">Manage</p>
          <NavLinks items={items} orientation="vertical" />
        </nav>

        <div className="px-3 pb-2">
          <SignOutButton />
        </div>
        <div className="flex items-center gap-3 border-t border-border px-4 py-3.5">
          <Avatar name={me.email} size="sm" />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <span className="w-full truncate text-sm font-semibold text-fg" title={me.email}>
              {me.email}
            </span>
            <Authority me={me} />
          </div>
        </div>
      </aside>

      <main id="main" tabIndex={-1} className="min-w-0 flex-1 p-3 focus:outline-none lg:p-0">
        {children}
      </main>
    </div>
  );
}
