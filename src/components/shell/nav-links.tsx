"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  label: string;
}

/**
 * Menu links (reference A: text-only items, the current one on a grey
 * fill). The current section is marked with aria-current.
 */
export function NavLinks({ items, orientation }: { items: NavItem[]; orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  return (
    <ul
      className={cn(
        "flex gap-0.5",
        orientation === "vertical" ? "flex-col" : "flex-row gap-1 overflow-x-auto overflow-y-hidden",
      )}
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-control items-center rounded-lg px-3 text-sm whitespace-nowrap",
                active ? "bg-surface-hover font-semibold text-fg" : "font-medium text-fg hover:bg-surface-hover/70",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
