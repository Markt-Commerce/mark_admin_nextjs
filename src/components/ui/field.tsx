import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Label, control, hint and inline error for one form field. Pass the same
 * `id` to the control and spread `describedBy(id, …)` onto it so screen
 * readers announce the hint and error with the field.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  optional,
  counter,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  /** Show "(optional)" after the label. */
  optional?: boolean;
  /** e.g. "12 / 255" for length-limited text. */
  counter?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-fg">
          {label}
          {required && <span className="text-danger-fg"> *</span>}
          {optional && <span className="font-normal text-fg-muted"> (optional)</span>}
        </label>
        {counter && <span className="text-xs text-fg-muted tabular-nums">{counter}</span>}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger-fg" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, opts: { hint?: unknown; error?: unknown }) {
  const ids = [opts.error ? `${id}-error` : opts.hint ? `${id}-hint` : null].filter(Boolean);
  return {
    "aria-describedby": ids.length ? ids.join(" ") : undefined,
    "aria-invalid": opts.error ? true : undefined,
  } as const;
}

const control =
  "w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg placeholder:text-fg-muted " +
  "hover:border-fg-muted disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-muted " +
  "aria-invalid:border-danger aria-invalid:bg-danger-subtle/40 focus-visible:outline-2 focus-visible:outline-offset-0";

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cn(control, "min-h-control", className)} {...rest} />;
}

export function Textarea({ className, rows = 4, ...rest }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cn(control, "py-2.5 leading-6", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <span className={cn("relative block", className)}>
      <select className={cn(control, "min-h-control appearance-none pr-9")} {...rest}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted"
      />
    </span>
  );
}

/** Checkbox with its label; the whole row is the 40px target. */
export function Checkbox({
  label,
  description,
  className,
  ...rest
}: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label className={cn("flex min-h-control cursor-pointer items-start gap-3 py-2 has-disabled:cursor-not-allowed", className)}>
      <input
        type="checkbox"
        className="mt-0.5 size-4.5 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
        {...rest}
      />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-fg">{label}</span>
        {description && <span className="text-sm text-fg-muted">{description}</span>}
      </span>
    </label>
  );
}

/**
 * On/off switch. A native checkbox with role="switch", so it works with a
 * plain form post and the keyboard (Space toggles) without extra script.
 */
export function Toggle({
  label,
  description,
  className,
  ...rest
}: Omit<ComponentProps<"input">, "type" | "role"> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label
      className={cn(
        "flex min-h-control cursor-pointer items-center justify-between gap-4 py-2 has-disabled:cursor-not-allowed",
        className,
      )}
    >
      <span className="flex flex-col">
        <span className="text-sm font-medium text-fg">{label}</span>
        {description && <span className="text-sm text-fg-muted">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" role="switch" className="peer sr-only" {...rest} />
        <span
          aria-hidden
          className={cn(
            "h-6 w-11 rounded-full bg-border-strong transition-colors",
            "peer-checked:bg-primary peer-disabled:opacity-50",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
          )}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full bg-surface shadow-card transition-transform peer-checked:translate-x-5"
        />
      </span>
    </label>
  );
}
