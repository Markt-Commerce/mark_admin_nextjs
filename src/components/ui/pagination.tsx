import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { PageSelect } from "./page-select";

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

const box = "inline-flex size-control items-center justify-center rounded-lg text-sm font-medium tabular-nums";

/**
 * Pagination footer after reference A: "Page [01 ▾] out of N" and a grouped
 * row of page boxes. Built only from the API envelope
 * `{ page, per_page, total_items, total_pages }`; links keep every other
 * query parameter.
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
  const current = Math.min(page, Math.max(totalPages, 1));

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 pt-1">
      <p className="text-sm text-fg-muted">
        {first.toLocaleString("en-GB")}–{last.toLocaleString("en-GB")} of {totalItems.toLocaleString("en-GB")}{" "}
        {totalItems === 1 ? noun : `${noun}s`}
      </p>
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            Page
            <PageSelect pathname={pathname} params={params} page={current} totalPages={totalPages} />
            out of {totalPages}
          </div>
          <ul className="flex items-center gap-0.5 rounded-xl bg-surface-muted p-1">
            <li>
              {page > 1 ? (
                <Link href={hrefFor(pathname, params, page - 1)} aria-label="Previous page" className={cn(box, "text-fg hover:bg-surface")}>
                  <ChevronLeft aria-hidden className="size-4" />
                </Link>
              ) : (
                <span aria-disabled="true" aria-label="Previous page" className={cn(box, "text-border-strong")}>
                  <ChevronLeft aria-hidden className="size-4" />
                </span>
              )}
            </li>
            {pageWindow(current, totalPages).map((p, i) =>
              p === "gap" ? (
                <li key={`gap-${i}`} aria-hidden className={cn(box, "text-fg-muted")}>
                  …
                </li>
              ) : (
                <li key={p}>
                  <Link
                    href={hrefFor(pathname, params, p)}
                    aria-current={p === page ? "page" : undefined}
                    aria-label={`Page ${p}`}
                    className={cn(box, p === page ? "bg-surface font-semibold text-fg shadow-card" : "text-fg-muted hover:bg-surface hover:text-fg")}
                  >
                    {p}
                  </Link>
                </li>
              ),
            )}
            <li>
              {page < totalPages ? (
                <Link href={hrefFor(pathname, params, page + 1)} aria-label="Next page" className={cn(box, "text-fg hover:bg-surface")}>
                  <ChevronRight aria-hidden className="size-4" />
                </Link>
              ) : (
                <span aria-disabled="true" aria-label="Next page" className={cn(box, "text-border-strong")}>
                  <ChevronRight aria-hidden className="size-4" />
                </span>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
