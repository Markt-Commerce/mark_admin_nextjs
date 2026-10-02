import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/status";
import { Dot } from "./badge";

export interface ChipItem {
  label: string;
  href: string;
  active: boolean;
  /** Colour of the dot; omit for "All". */
  tone?: Tone;
}

/**
 * Quick filters as rounded chips with a coloured dot (reference A's
 * "All · Admin · Management …" row). Each chip is a link, so views are
 * shareable and work without script.
 */
export function FilterChips({ label, items }: { label: string; items: ChipItem[] }) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap items-center gap-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-current={item.active ? "true" : undefined}
              className={cn(
                "inline-flex min-h-control items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap",
                item.active
                  ? "border-fg bg-surface text-fg shadow-card"
                  : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
              )}
            >
              {item.tone ? <Dot tone={item.tone} /> : <span aria-hidden className="inline-block size-2 rounded-full bg-fg" />}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
