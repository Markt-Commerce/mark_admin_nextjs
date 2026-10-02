/* eslint-disable @next/next/no-img-element -- static brand SVG */
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Banner } from "@/components/ui/surface";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

const NOTICES: Record<string, { tone: "info" | "warning"; title: string; body: string }> = {
  expired: {
    tone: "warning",
    title: "Your session has ended",
    body: "You were signed out, or your access changed. Sign in again to continue.",
  },
  "signed-out": {
    tone: "info",
    title: "You've signed out",
    body: "Your sessions on every device have been ended.",
  },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const reason = typeof sp.reason === "string" ? sp.reason : undefined;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const notice = reason ? NOTICES[reason] : undefined;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Brand panel (reference C). brand-strong keeps white text at 5:1. */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-strong p-12 text-white lg:flex">
        <img src="/brand/markt-logo.svg" alt="Markt" className="h-12 w-auto self-start brightness-0 invert" />
        <div className="max-w-sm">
          <h1 className="text-2xl font-semibold">Markt staff console</h1>
          <p className="mt-3 text-base leading-7">
            Review seller verification, look after customer accounts and keep shops trustworthy.
          </p>
        </div>
        <p className="text-sm">For Markt staff only.</p>
      </aside>

      <main className="flex items-center justify-center bg-surface px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <img src="/brand/markt-logo.svg" alt="Markt" className="mb-8 h-10 w-auto lg:hidden" />
          <h2 className="text-2xl font-semibold text-fg">Sign in</h2>
          <p className="mt-1 text-sm text-fg-muted">Use your Markt staff email and password.</p>

          {notice && (
            <Banner tone={notice.tone} title={notice.title} className="mt-6">
              {notice.body}
            </Banner>
          )}

          <div className="mt-6">
            <LoginForm next={next} />
          </div>

          <p className="mt-8 flex items-start gap-2 text-sm text-fg-muted">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              Don&apos;t share your sign-in details. Every action you take in the console is recorded against your
              account.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
