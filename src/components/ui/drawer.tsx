"use client";

import { X } from "lucide-react";
import { type ReactNode, useId } from "react";
import { IconButton } from "./button";
import { useModalDialog } from "./modal";

/**
 * A full-height panel that slides over the right edge of the page, for
 * tasks with more to read than a Modal holds (reference: Stripe's "Manage
 * roles" drawer). Same native <dialog> behaviour as Modal: a real focus
 * trap, Escape closes unless busy, and focus returns to whatever opened it.
 * Below 768px it covers the whole screen.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  avatar,
  children,
  footer,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** One line under the title, e.g. who the drawer is about. */
  description?: ReactNode;
  avatar?: ReactNode;
  children: ReactNode;
  /** Buttons, right-aligned: Cancel first, then the action. */
  footer?: ReactNode;
  /** While a request is in flight, Escape and the close button do nothing. */
  busy?: boolean;
}) {
  const titleId = useId();
  const descId = useId();
  const dialogProps = useModalDialog({ open, onClose, busy });

  return (
    <dialog
      {...dialogProps}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-[46rem] border-l border-border bg-surface p-0 text-fg shadow-modal md:rounded-l-xl"
    >
      {open && (
        <div className="flex h-full flex-col">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div className="flex min-w-0 items-center gap-3">
              {avatar}
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-semibold">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="text-sm break-words text-fg-muted">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <IconButton label="Close" icon={<X className="size-4" />} onClick={onClose} disabled={busy} />
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4">{footer}</footer>
          )}
        </div>
      )}
    </dialog>
  );
}
