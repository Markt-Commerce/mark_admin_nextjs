/* eslint-disable @next/next/no-img-element -- static brand SVGs */
import type { Metadata } from "next";
import { Watermark } from "@/components/brand/watermark";
import { Banner } from "@/components/ui/surface";
import { CloudEdge } from "./cloud-edge";
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

/**
 * Sign-in page after reference C: a brand panel on the left with a scalloped
 * cloud edge and a faint logo watermark, the form on the right.
 */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const reason = typeof sp.reason === "string" ? sp.reason : undefined;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const notice = reason ? NOTICES[reason] : undefined;

  return (
    <div className="relative grid min-h-dvh overflow-hidden bg-surface lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Brand panel. The gradient keeps white body text at 4.5:1 or better. */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-b from-brand via-brand-strong to-brand-deep text-white lg:block">
        <Watermark className="absolute -bottom-28 -left-24 w-[24rem] rotate-[-14deg] text-white opacity-15" />
        <div className="relative flex h-full flex-col items-center justify-between px-12 pt-16 pb-10 pr-44 text-center">
          <div />
          <div className="flex flex-col items-center">
            <p className="text-3xl font-bold">Welcome to</p>
            <img src="/brand/markt-logo.svg" alt="Markt" className="mt-10 h-28 w-auto brightness-0 invert" />
            <p className="mt-14 max-w-xs text-sm leading-6">
              The staff console for reviewing sellers, looking after customer accounts and keeping shops trustworthy.
            </p>
          </div>
          <p className="text-sm">
            For <span className="font-semibold">Markt staff</span> only
          </p>
        </div>
        <CloudEdge className="absolute top-0 right-0 h-full w-64" />
      </aside>

      <main className="relative flex items-center px-6 py-12 sm:px-12 lg:px-20">
        <Watermark className="absolute -right-20 -bottom-24 hidden w-[22rem] rotate-[-14deg] text-brand opacity-10 lg:block" />
        <div className="relative w-full max-w-md">
          <img src="/brand/markt-logo.svg" alt="Markt" className="mb-10 h-10 w-auto lg:hidden" />
          <h1 className="text-4xl font-bold text-brand">Sign in</h1>
          <p className="mt-2 text-sm text-fg-muted">Please fill in your staff credentials to sign in.</p>

          {notice && (
            <Banner tone={notice.tone} title={notice.title} className="mt-6">
              {notice.body}
            </Banner>
          )}

          <div className="mt-8">
            <LoginForm next={next} />
          </div>
        </div>
      </main>
    </div>
  );
}
