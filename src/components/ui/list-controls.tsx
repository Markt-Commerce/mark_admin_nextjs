"use client";

import { ListFilter, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { Select } from "./field";

type Params = Record<string, string | undefined>;

function HiddenParams({ params, omit }: { params: Params; omit: string[] }) {
  return (
    <>
      {Object.entries(params)
        .filter(([k, v]) => v && !omit.includes(k) && k !== "page")
        .map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
    </>
  );
}

/**
 * Search box that submits as a plain GET form: works without script, keeps
 * the active filters, and resets to page 1.
 */
export function SearchBox({
  pathname,
  params,
  name = "q",
  label,
  placeholder,
}: {
  pathname: string;
  params: Params;
  name?: string;
  /** Accessible label, e.g. "Search users". */
  label: string;
  placeholder: string;
}) {
  const id = useId();
  const value = params[name] ?? "";
  const clearParams = new URLSearchParams(
    Object.entries(params).filter(([k, v]) => v && k !== name && k !== "page") as [string, string][],
  ).toString();

  return (
    <form action={pathname} method="get" role="search" className="relative w-full sm:w-72">
      <HiddenParams params={params} omit={[name]} />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted" />
      <input
        id={id}
        name={name}
        type="search"
        defaultValue={value}
        key={value}
        placeholder={placeholder}
        className="min-h-control w-full rounded-lg border border-border bg-surface pr-10 pl-9 text-sm shadow-card placeholder:text-fg-muted hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-0 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <Link
          href={clearParams ? `${pathname}?${clearParams}` : pathname}
          aria-label="Clear search"
          className="absolute top-1/2 right-0.5 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-fg-muted hover:text-fg"
        >
          <X aria-hidden className="size-4" />
        </Link>
      )}
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}

export interface FilterDef {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  /** Label of the "no filter" option. */
  anyLabel?: string;
  /**
   * Value of the "no filter" option. Defaults to "" (param omitted). Pages
   * with a default view (sellers default to pending) use an explicit value
   * such as "all" so choosing "Any" is distinguishable from no choice.
   */
  anyValue?: string;
}

/**
 * "Filters" button that opens a panel of selects, applied as a GET form.
 * The button shows how many filters are active. Escape closes the panel.
 */
export function FilterControl({
  pathname,
  params,
  filters,
  /** Params to keep when clearing filters, e.g. the search query. */
  keep = ["q"],
  /** Value a cleared filter should take, when a page has a default view. */
  clearTo,
}: {
  pathname: string;
  params: Params;
  filters: FilterDef[];
  keep?: string[];
  clearTo?: Params;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const active = filters.filter((f) => params[f.name] && params[f.name] !== (f.anyValue ?? "")).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const cleared = new URLSearchParams();
  for (const k of keep) if (params[k]) cleared.set(k, params[k]!);
  for (const [k, v] of Object.entries(clearTo ?? {})) if (v !== undefined) cleared.set(k, v);
  const clearHref = cleared.toString() ? `${pathname}?${cleared}` : pathname;

  return (
    <div ref={wrapper} className="relative">
      <Button
        ref={trigger}
        icon={<ListFilter aria-hidden className="size-4" />}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg border-border px-3 font-medium shadow-card"
      >
        Filter
        {active > 0 && (
          <span className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-on-primary">
            {active}
            <span className="sr-only"> active</span>
          </span>
        )}
      </Button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-border bg-surface p-4 shadow-popover"
      >
        <form action={pathname} method="get" className="flex flex-col gap-4">
          <HiddenParams params={params} omit={filters.map((f) => f.name)} />
          {filters.map((f) => (
            <label key={f.name} className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">{f.label}</span>
              <Select name={f.name} defaultValue={params[f.name] ?? f.anyValue ?? ""}>
                <option value={f.anyValue ?? ""}>{f.anyLabel ?? "Any"}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </label>
          ))}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Link href={clearHref} className={cn("text-sm font-medium text-brand-strong underline-offset-4 hover:underline", "inline-flex min-h-control items-center")}>
              Clear filters
            </Link>
            <Button type="submit" variant="primary">
              Apply filters
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
