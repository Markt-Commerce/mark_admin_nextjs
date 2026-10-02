import { ArrowLeft, CircleAlert, Info, TriangleAlert, CircleCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-surface shadow-card", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-fg">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("px-5 py-4", bodyClassName)}>{children}</div>
    </section>
  );
}

type BannerTone = "info" | "warning" | "danger" | "success";

const bannerTone: Record<BannerTone, { cls: string; icon: ReactNode }> = {
  info: { cls: "border-info-border bg-info-bg text-info-fg", icon: <Info /> },
  warning: { cls: "border-warning-border bg-warning-bg text-warning-fg", icon: <TriangleAlert /> },
  danger: { cls: "border-danger-border bg-danger-bg text-danger-fg", icon: <CircleAlert /> },
  success: { cls: "border-success-border bg-success-bg text-success-fg", icon: <CircleCheck /> },
};

/** Full-width state message, e.g. "Banned on 2 Oct 2026. Sold counterfeit goods." */
export function Banner({
  tone = "info",
  title,
  children,
  actions,
  className,
}: {
  tone?: BannerTone;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const t = bannerTone[tone];
  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={cn("flex flex-wrap items-start gap-3 rounded-lg border px-4 py-3", t.cls, className)}
    >
      <span aria-hidden className="mt-0.5 [&>svg]:size-5">
        {t.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {children && <div className="mt-0.5 text-sm text-fg">{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block animate-pulse rounded-md bg-border", className)} />;
}

/**
 * Hover and keyboard-focus tooltip for supplementary text. Never the only
 * place information lives: the trigger must make sense without it.
 */
export function Tooltip({ content, children, id }: { content: ReactNode; children: ReactNode; id: string }) {
  return (
    <span className="group relative inline-flex">
      <span aria-describedby={id} className="inline-flex">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-64 -translate-x-1/2 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-on-primary opacity-0 shadow-popover transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-control items-center gap-1.5 rounded-md text-sm font-medium text-fg-muted hover:text-fg"
    >
      <ArrowLeft aria-hidden className="size-4" />
      {children}
    </Link>
  );
}

/** Key/value rows for detail panels. A null value shows an em dash. */
export function DetailList({
  items,
  className,
}: {
  items: Array<{ label: ReactNode; value: ReactNode | null | undefined; key?: string }>;
  className?: string;
}) {
  return (
    <dl className={cn("flex flex-col divide-y divide-border", className)}>
      {items.map((item, i) => (
        <div key={item.key ?? i} className="grid grid-cols-[minmax(7rem,40%)_1fr] gap-3 py-2.5 first:pt-0 last:pb-0">
          <dt className="text-sm text-fg-muted">{item.label}</dt>
          <dd className="min-w-0 text-sm break-words text-fg">
            {item.value === null || item.value === undefined || item.value === "" ? (
              <span className="text-fg-muted" aria-label="Not set">
                —
              </span>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
