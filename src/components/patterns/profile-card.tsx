import type { ReactNode } from "react";

/**
 * Left-column identity card for a user or a shop: picture, name, a line
 * under it, state badges, then the action bar. Actions are passed in
 * already permission-gated.
 */
export function ProfileCard({
  avatar,
  name,
  subtitle,
  badges,
  actions,
  children,
}: {
  avatar: ReactNode;
  name: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  /** Compact actions and the permission-gated overflow menu. */
  actions?: ReactNode;
  /** Extra details below the actions. */
  children?: ReactNode;
}) {
  return (
    <section>
      <div className="flex flex-col items-center gap-3 px-5 pt-6 pb-5 text-center">
        {avatar}
        <div className="min-w-0 max-w-full">
          <h1 className="text-lg font-semibold break-words text-fg">{name}</h1>
          {subtitle && <p className="mt-0.5 text-sm break-words text-fg-muted">{subtitle}</p>}
        </div>
        {badges && <div className="flex flex-wrap justify-center gap-1.5">{badges}</div>}
      </div>
      {actions && <div className="flex flex-col gap-3 px-4 pb-5">{actions}</div>}
      {children && <div className="border-t border-border px-5 py-4">{children}</div>}
    </section>
  );
}

/** A labelled group inside a profile card's action bar. */
export function ActionGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2 pt-2 first:pt-0">
      <p className="text-xs font-semibold text-fg-muted">{label}</p>
      {children}
    </div>
  );
}
