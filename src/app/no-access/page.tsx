/* eslint-disable @next/next/no-img-element -- static brand SVG */
import { ShieldOff } from "lucide-react";
import type { Metadata } from "next";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "No access" };

/**
 * Reached when the API answers /admin/me with 403: the account is signed in
 * but has no staff standing (for example, its admin role was removed).
 */
export default function NoAccessPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-card">
        <img src="/brand/markt-logo.svg" alt="Markt" className="mx-auto h-9 w-auto" />
        <span className="mx-auto mt-8 flex size-12 items-center justify-center rounded-full bg-neutral-bg text-neutral-fg">
          <ShieldOff aria-hidden className="size-6" />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-fg">This account doesn&apos;t have admin access</h1>
        <p className="mt-2 text-sm text-fg-muted">
          The staff console is only for Markt staff. If you need access, ask a super admin to give your account a staff
          role, then sign in again.
        </p>
        <form action={logout} className="mt-6">
          <Button type="submit" variant="primary" fullWidth>
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
