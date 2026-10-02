import { CircleAlert, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./surface";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Applied to both th and td, e.g. width or alignment. */
  className?: string;
}

/**
 * Data table with its three non-data states built in. The wrapper scrolls
 * horizontally, so a wide table never breaks the page layout at 1280px or
 * narrower. Sorting is off by default: the API does not sort on request.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  empty,
  error,
  minWidth = "64rem",
}: {
  /** Read by screen readers; describe what the table lists. */
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  empty?: { title: string; description?: ReactNode; action?: ReactNode };
  /** When set, the error state replaces the rows. */
  error?: { message: string; action?: ReactNode };
  minWidth?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm" style={{ minWidth }}>
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface-muted">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn("border-b border-border px-4 py-3 text-xs font-semibold text-fg-muted", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!error &&
              rows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-surface-hover/60">
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {error ? (
        <TableMessage icon={<CircleAlert />} tone="danger" title="This list couldn't be loaded" action={error.action}>
          {error.message}
        </TableMessage>
      ) : (
        rows.length === 0 &&
        empty && (
          <TableMessage icon={<Inbox />} title={empty.title} action={empty.action}>
            {empty.description}
          </TableMessage>
        )
      )}
    </div>
  );
}

function TableMessage({
  icon,
  title,
  children,
  action,
  tone,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "danger";
}) {
  return (
    <div role={tone === "danger" ? "alert" : undefined} className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <span
        aria-hidden
        className={cn(
          "mb-1 inline-flex size-10 items-center justify-center rounded-full [&>svg]:size-5",
          tone === "danger" ? "bg-danger-bg text-danger-fg" : "bg-surface-muted text-fg-muted",
        )}
      >
        {icon}
      </span>
      <p className="text-base font-semibold text-fg">{title}</p>
      {children && <p className="max-w-md text-sm text-fg-muted">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Placeholder rows while a list loads (used by loading.tsx files). */
export function TableSkeleton({ columns = 6, rows = 8, caption }: { columns?: number; rows?: number; caption: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card" aria-busy="true">
      <span className="sr-only" role="status">
        Loading {caption}
      </span>
      <div className="flex gap-4 border-b border-border bg-surface-muted px-4 py-3.5">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-0">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          {Array.from({ length: columns - 1 }, (_, c) => (
            <Skeleton key={c} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
