"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useToast } from "./toast";

/**
 * Copies a value to the clipboard (reference A's icon beside each email).
 * `label` names what is copied, for the accessible name and the toast.
 */
export function CopyButton({
  value,
  label,
  variant = "icon",
  className,
}: {
  value: string;
  label: string;
  /** `icon`: bare icon beside text. `button`: outlined "Copy …" button (reference D). */
  variant?: "icon" | "button";
  className?: string;
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Copied ${label}`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(`Couldn't copy the ${label}. Select it and copy it by hand.`);
    }
  };

  const Icon = copied ? Check : Copy;

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={copy}
        className={cn(
          "inline-flex min-h-control items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 text-sm font-semibold text-fg shadow-card hover:bg-surface-hover",
          className,
        )}
      >
        <Icon aria-hidden className="size-4" />
        Copy {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      className={cn(
        "inline-flex size-control shrink-0 items-center justify-center rounded-md text-info-fg hover:bg-info-bg",
        className,
      )}
    >
      <Icon aria-hidden className="size-4" />
    </button>
  );
}
