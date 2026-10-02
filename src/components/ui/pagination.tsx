import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Params = Record<string, string | undefined>;

function hrefFor(pathname: string, params: Params, page: number): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) search.set(k, v);
  if (page > 1) search.set("page", String(page));
  else search.delete("page");
  const qs = search.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Page numbers with gaps: 1 … 4 5 6 … 12 */
function pageWindow(current: number, total: number): Array<number | "gap"> {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

/**
 * Pagination built only from the API envelope
 * `{ page, per_page, total_items, total_pages }`. Links keep every other
 * query parameter (search, filters), so the page is shareable.
 */
export function Pagination({
  pathname,
  params,
  page,
  perPage,
  totalItems,
  totalPages,
  noun = "result",
}: {
  pathname: string;
  /** Current query params other than `page`. */
  params: Params;
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  noun?: string;
}) {
  if (totalItems === 0) return null;
  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, totalItems);
  const linkCls =
    "inline-flex min-h-control min-w-10 items-center justify-center gap-1 rounded-md px-3 text-sm font-medium";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-sm text-fg-muted">
        Showing <span className="font-semibold text-fg tabular-nums">{first.toLocaleString("en-GB")}</span>–
        <span className="font-semibold text-fg tabular-nums">{last.toLocaleString("en-GB")}</span> of{" "}
        <span className="font-semibold text-fg tabular-nums">{totalItems.toLocaleString("en-GB")}</span>{" "}
        {totalItems === 1 ? noun : `${noun}s`}
      </p>
      {totalPages > 1 && (
        <ul className="flex flex-wrap items-center gap-1">
          <li>
            {page > 1 ? (
              <Link href={hrefFor(pathname, params, page - 1)} className={cn(linkCls, "hover:bg-surface-hover")}>
                <ChevronLeft aria-hidden className="size-4" /> Previous
              </Link>
            ) : (
              <span aria-disabled="true" className={cn(linkCls, "text-fg-muted opacity-60")}>
                <ChevronLeft aria-hidden className="size-4" /> Previous
              </span>
            )}
          </li>
          {pageWindow(page, totalPages).map((p, i) =>
            p === "gap" ? (
              <li key={`gap-${i}`} aria-hidden className="px-1 text-fg-muted">
                …
              </li>
            ) : (
              <li key={p}>
                <Link
                  href={hrefFor(pathname, params, p)}
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`Page ${p}`}
                  className={cn(
                    linkCls,
                    "tabular-nums",
                    p === page ? "bg-primary text-on-primary" : "hover:bg-surface-hover",
                  )}
                >
                  {p}
                </Link>
              </li>
            ),
          )}
          <li>
            {page < totalPages ? (
              <Link href={hrefFor(pathname, params, page + 1)} className={cn(linkCls, "hover:bg-surface-hover")}>
                Next <ChevronRight aria-hidden className="size-4" />
              </Link>
            ) : (
              <span aria-disabled="true" className={cn(linkCls, "text-fg-muted opacity-60")}>
                Next <ChevronRight aria-hidden className="size-4" />
              </span>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}
