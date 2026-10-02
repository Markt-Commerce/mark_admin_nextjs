"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

/** Menu links; the current section is marked with aria-current. */
export function NavLinks({ items, orientation }: { items: NavItem[]; orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  return (
    <ul className={cn("flex gap-1", orientation === "vertical" ? "flex-col" : "flex-row overflow-x-auto")}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-control items-center gap-3 rounded-md px-3 text-sm font-semibold whitespace-nowrap",
                active ? "bg-brand-subtle text-fg" : "text-fg-muted hover:bg-surface-hover hover:text-fg",
              )}
            >
              {active && orientation === "vertical" && (
                <span aria-hidden className="absolute top-2 bottom-2 left-0 w-1 rounded-full bg-brand" />
              )}
              <span aria-hidden className={cn("[&>svg]:size-4.5", active && "text-brand-strong")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
