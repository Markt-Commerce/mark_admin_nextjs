"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId } from "react";

/** "Page [01 ▾]" jump control. Choosing a page navigates straight to it. */
export function PageSelect({
  pathname,
  params,
  page,
  totalPages,
}: {
  pathname: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const id = useId();

  const go = (next: number) => {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) search.set(k, v);
    if (next > 1) search.set("page", String(next));
    const qs = search.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <span className="relative inline-flex">
      <label htmlFor={id} className="sr-only">
        Go to page
      </label>
      <select
        id={id}
        value={page}
        onChange={(e) => go(Number(e.target.value))}
        className="min-h-control appearance-none rounded-lg border border-border bg-surface pr-8 pl-3 text-sm font-semibold tabular-nums shadow-card hover:border-border-strong"
      >
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <option key={p} value={p}>
            {String(p).padStart(2, "0")}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-muted" />
    </span>
  );
}
