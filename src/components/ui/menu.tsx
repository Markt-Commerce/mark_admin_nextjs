"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  /** Destructive items are shown in red. */
  danger?: boolean;
}

export type MenuSection = { label: string; items: MenuItem[] };

/**
 * Button that opens a list of actions (reference B's "⋯"). Keyboard: Enter,
 * Space or ArrowDown opens; arrows move; Home/End jump; Escape closes and
 * returns focus to the button. Every action in it is a visible menu item.
 */
export function Menu({
  label,
  trigger,
  sections,
  align = "center",
  triggerClassName,
}: {
  /** Accessible name of the trigger, e.g. "More actions". */
  label: string;
  trigger: ReactNode;
  sections: MenuSection[];
  align?: "start" | "center" | "end";
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const flat = sections.flatMap((s) => s.items);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[0]?.focus();
    const onDown = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (flat.length === 0) return null;

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const onMenuKey = (e: KeyboardEvent) => {
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    const go = (i: number) => itemRefs.current[(i + flat.length) % flat.length]?.focus();
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); go(current + 1); break;
      case "ArrowUp": e.preventDefault(); go(current - 1); break;
      case "Home": e.preventDefault(); go(0); break;
      case "End": e.preventDefault(); go(flat.length - 1); break;
      case "Escape": e.preventDefault(); close(); break;
      case "Tab": close(false); break;
    }
  };

  // Position of each section's first item in the flat (keyboard) order.
  const offsets = sections.map((_, si) => sections.slice(0, si).reduce((n, sec) => n + sec.items.length, 0));
  return (
    <div ref={wrapper} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKey}
          className={cn(
            "absolute top-full z-30 mt-2 w-64 rounded-lg border border-border bg-surface p-1.5 shadow-popover",
            align === "start" && "left-0",
            align === "end" && "right-0",
            align === "center" && "left-1/2 -translate-x-1/2",
          )}
        >
          {sections.map((section, si) =>
            section.items.length ? (
              <div key={section.label} role="group" aria-label={section.label} className={cn(si > 0 && "mt-1 border-t border-border pt-1")}>
                <p className="px-2.5 pt-1.5 pb-1 text-xs font-semibold text-fg-muted">{section.label}</p>
                {section.items.map((item, ii) => {
                  const i = offsets[si] + ii;
                  return (
                    <button
                      key={item.label}
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      type="button"
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => {
                        // A dialog opened by this item must return focus to
                        // the persistent trigger, not the unmounted menu item.
                        close();
                        item.onSelect();
                      }}
                      className={cn(
                        "flex min-h-control w-full items-center gap-2.5 rounded-md px-2.5 text-left text-sm font-medium focus:outline-none",
                        item.danger
                          ? "text-danger-fg hover:bg-danger-subtle focus:bg-danger-subtle"
                          : "text-fg hover:bg-surface-hover focus:bg-surface-hover",
                      )}
                    >
                      {item.icon && <span aria-hidden className="[&>svg]:size-4">{item.icon}</span>}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
