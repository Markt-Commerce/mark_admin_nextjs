"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";

export interface ModalIdentity {
  name: string;
  subtitle?: string | null;
  avatar: ReactNode;
  actions?: ReactNode;
}

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
  identity,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons, right-aligned: Cancel first, then the action. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  identity?: ModalIdentity;
  /** While a request is in flight, Escape does nothing. */
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
      // showModal() focuses the first focusable element.
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
        <div className="flex max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto">
          <div aria-hidden className="h-20 shrink-0 rounded-t-xl border-b border-border bg-surface-muted" />
          <header className="shrink-0 border-b border-border px-6 pb-4">
            {identity && (
              <>
                <div className="-mt-9 mb-3 flex flex-wrap items-end justify-between gap-3">
                  <div className="rounded-full bg-surface p-1 ring-1 ring-border">{identity.avatar}</div>
                  {identity.actions && <div className="flex flex-wrap gap-2 pt-10">{identity.actions}</div>}
                </div>
                <p className="text-base font-semibold break-words">{identity.name}</p>
                {identity.subtitle && <p className="mt-0.5 text-sm break-words text-fg-muted">{identity.subtitle}</p>}
              </>
            )}
            <div className="min-w-0 pt-4">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-1 text-sm text-fg-muted">
                  {description}
                </p>
              )}
            </div>
          </header>
          <div className="px-6 py-5">{children}</div>
          {footer && (
            <footer className="sticky bottom-0 flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">{footer}</footer>
          )}
        </div>
      )}
    </dialog>
  );
}
