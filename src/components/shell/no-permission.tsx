import { Lock } from "lucide-react";

/** Shown in place of a page whose view permission the operator lacks. */
export function NoPermission({ what }: { what: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-neutral-bg text-neutral-fg">
        <Lock aria-hidden className="size-6" />
      </span>
      <h1 className="text-xl font-semibold">You can&apos;t view {what}</h1>
      <p className="text-sm text-fg-muted">Your role doesn&apos;t include this. Ask a super admin if you need it.</p>
    </div>
  );
}
