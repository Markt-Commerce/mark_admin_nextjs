import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** A <BackLink>, shown above the title. */
  back?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-1">
      {back && <div className="-ml-0.5">{back}</div>}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-fg">{title}</h1>
          {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/**
 * List page after reference A: one white panel with the title bar, a
 * toolbar (quick-filter chips on the left; Filter and search on the
 * right), then the table and the pagination footer.
 */
export function ListPanel({
  title,
  actions,
  chips,
  filters,
  search,
  children,
}: {
  title: ReactNode;
  actions?: ReactNode;
  chips?: ReactNode;
  filters?: ReactNode;
  search?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface shadow-card">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
        <h1 className="text-lg font-semibold text-fg">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <div className="flex flex-col gap-4 p-5">
        {(chips || filters || search) && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">{chips}</div>
            <div className="flex flex-wrap items-center gap-2">
              {filters}
              {search}
            </div>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/**
 * Detail page in three columns: profile card on the left, tabbed main
 * content in the middle, side panels on the right. Below 1280px the side
 * panels move under the main content; below 1024px everything stacks.
 */
export function DetailLayout({
  back,
  banners,
  profile,
  main,
  aside,
}: {
  back?: ReactNode;
  /** Account-state banners, full width above the columns. */
  banners?: ReactNode;
  profile: ReactNode;
  main: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      {back}
      {banners && <div className="flex flex-col gap-3">{banners}</div>}
      <div
        className={cn(
          "grid items-start gap-5",
          "lg:grid-cols-[17rem_minmax(0,1fr)]",
          !!aside && "xl:grid-cols-[17rem_minmax(0,1fr)_18rem]",
        )}
      >
        <div className="flex flex-col gap-5 lg:sticky lg:top-[calc(var(--spacing-topbar)+1.5rem)]">{profile}</div>
        <div className="flex min-w-0 flex-col gap-5">{main}</div>
        {aside && <div className="flex min-w-0 flex-col gap-5 lg:col-start-2 xl:col-start-auto">{aside}</div>}
      </div>
    </div>
  );
}
