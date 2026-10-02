"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error";

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: ReactNode;
}

interface ToastApi {
  success: (message: ReactNode) => void;
  error: (message: ReactNode) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Success toasts clear themselves; error toasts stay until dismissed. */
const SUCCESS_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (tone: ToastTone, message: ReactNode) => {
      const id = nextId.current++;
      setItems((all) => [...all.slice(-3), { id, tone, message }]);
      if (tone === "success") setTimeout(() => dismiss(id), SUCCESS_MS);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push("success", m), error: (m) => push("error", m) }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border bg-surface px-4 py-3 shadow-popover",
              "animate-[toast-in_160ms_ease-out]",
              t.tone === "success" ? "border-success-border" : "border-danger-border",
            )}
          >
            <span aria-hidden className={cn("mt-0.5", t.tone === "success" ? "text-success-fg" : "text-danger-fg")}>
              {t.tone === "success" ? <CircleCheck className="size-5" /> : <CircleAlert className="size-5" />}
            </span>
            <p className="min-w-0 flex-1 text-sm text-fg">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="-m-2 inline-flex size-control items-center justify-center rounded-md text-fg-muted hover:bg-surface-hover hover:text-fg"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
