"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "./button";

/**
 * The one popup shell every dialog uses. Built on the native <dialog> in
 * modal mode, which gives a dimmed backdrop, makes the page behind inert
 * (a real focus trap) and closes on Escape. Focus returns to whatever
 * opened it.
 *
 * Clicking the backdrop does not close it: these dialogs hold reasons and
 * form input that an accidental click should not throw away.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  busy,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons, right-aligned: Cancel first, then the action. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** While a request is in flight, Escape and the close button do nothing. */
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      // showModal() focuses the first focusable element (the close button).
      // Content can ask for a better starting point with data-autofocus.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      returnFocus.current?.focus();
    }
  }, [open]);

  // Unmounting while open (e.g. navigating away) must not strand focus.
  useEffect(() => {
    const target = returnFocus;
    return () => target.current?.focus();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      // Browsers may still close a modal dialog on a repeated Escape even
      // when cancel is prevented; keep the parent's state in step.
      onClose={() => {
        if (open) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-xl border border-border bg-surface p-0 text-fg shadow-modal",
        size === "sm" && "max-w-md",
        size === "md" && "max-w-xl",
        size === "lg" && "max-w-2xl",
      )}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-4rem)] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-border px-6 pt-5 pb-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-1 text-sm text-fg-muted">
                  {description}
                </p>
              )}
            </div>
            <IconButton label="Close" icon={<X className="size-5" />} onClick={onClose} disabled={busy} className="-mt-1 -mr-2" />
          </header>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4">{footer}</footer>
          )}
        </div>
      )}
    </dialog>
  );
}
