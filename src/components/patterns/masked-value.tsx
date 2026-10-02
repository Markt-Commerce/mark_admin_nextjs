"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { maskTail } from "@/lib/format";

/** Hide again automatically so a revealed value is not left on screen. */
const REMASK_MS = 30_000;

/**
 * A sensitive value (bank account number) shown masked by default, with a
 * visible "Show"/"Hide" button. Never logged or copied anywhere else.
 */
export function MaskedValue({ value, label }: { value: string | null; label: string }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => setRevealed(false), REMASK_MS);
    return () => clearTimeout(timer);
  }, [revealed]);

  if (!value) {
    return (
      <span className="text-fg-muted" aria-label="Not set">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="font-mono text-sm tabular-nums" aria-live="polite">
        {revealed ? value : maskTail(value)}
      </span>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        aria-pressed={revealed}
        aria-label={`${revealed ? "Hide" : "Show"} ${label}`}
        className="inline-flex min-h-control items-center gap-1.5 rounded-md px-2 text-sm font-medium text-brand-strong hover:bg-surface-hover"
      >
        {revealed ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
        {revealed ? "Hide" : "Show"}
      </button>
    </span>
  );
}
